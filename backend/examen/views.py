import io

from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.permissions import IsAdministrateur
from hopital.models import Hopital
from hopital.serializers import HopitalSerializer

from .models import ExamenMedical, HopitalExamen
from .serializers import (
    BulkHopitalExamenSerializer,
    ExamenMedicalSerializer,
    HopitalExamenSerializer,
    HopitalLightSerializer,
)


class ExamenMedicalListView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        examens = ExamenMedical.objects.all()
        serializer = ExamenMedicalSerializer(examens, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ExamenMedicalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExamenMedicalDetailView(APIView):
    permission_classes = [IsAdministrateur]

    def get_object(self, pk):
        return get_object_or_404(ExamenMedical, pk=pk)

    def get(self, request, pk):
        examen = self.get_object(pk)
        serializer = ExamenMedicalSerializer(examen)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        examen = self.get_object(pk)
        serializer = ExamenMedicalSerializer(examen, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        examen = self.get_object(pk)

        if HopitalExamen.objects.filter(examen=examen).exists():
            return Response(
                {
                    "error": "Cet examen ne peut pas être supprimé car il est associé à un ou plusieurs hôpitaux."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        examen.delete()
        return Response(
            {"message": "Examen supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


class HopitalForExamensView(APIView):
    """Paginated hospital list with search, for the examens module."""

    permission_classes = [IsAdministrateur]

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        try:
            page = max(1, int(request.query_params.get("page", 1)))
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = max(1, int(request.query_params.get("page_size", 20)))
        except (TypeError, ValueError):
            page_size = 20

        hopitaux = Hopital.objects.select_related("type_hopital").all()

        if search:
            hopitaux = hopitaux.filter(
                Q(nom__icontains=search)
                | Q(adresse__icontains=search)
                | Q(type_hopital__nom__icontains=search)
            )

        hopitaux = hopitaux.order_by("-id")

        total = hopitaux.count()
        start = (page - 1) * page_size
        end = start + page_size
        hopitaux_page = hopitaux[start:end]

        serializer = HopitalLightSerializer(hopitaux_page, many=True)
        return Response(
            {
                "count": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class HopitalExamenListView(APIView):
    """List all associations for a specific hospital."""

    permission_classes = [IsAdministrateur]

    def get(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        associations = HopitalExamen.objects.filter(hopital=hopital).select_related(
            "examen"
        )
        serializer = HopitalExamenSerializer(associations, many=True)
        return Response(
            {
                "hopital": HopitalSerializer(hopital).data,
                "examens": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class HopitalExamenBulkView(APIView):
    """Bulk set associations for a hospital (replace all)."""

    permission_classes = [IsAdministrateur]

    def post(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        serializer = BulkHopitalExamenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        examen_ids = serializer.validated_data["examens"]

        existing = set(
            HopitalExamen.objects.filter(hopital=hopital).values_list(
                "examen_id", flat=True
            )
        )
        new = set(examen_ids) - existing
        to_remove = existing - set(examen_ids)

        HopitalExamen.objects.filter(hopital=hopital, examen_id__in=to_remove).delete()
        HopitalExamen.objects.bulk_create(
            [HopitalExamen(hopital=hopital, examen_id=eid) for eid in new],
            ignore_conflicts=True,
        )

        return Response(
            {"message": "Associations enregistrées avec succès."},
            status=status.HTTP_200_OK,
        )


class HopitalExamenDeleteView(APIView):
    """Delete a single association."""

    permission_classes = [IsAdministrateur]

    def delete(self, request, hopital_id, examen_id):
        association = HopitalExamen.objects.filter(
            hopital_id=hopital_id, examen_id=examen_id
        ).first()
        if not association:
            return Response(
                {"error": "Association introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        association.delete()
        return Response(
            {"message": "Association supprimée avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


class HopitalExamenExportExcelView(APIView):
    """Export examens for a single hospital as Excel."""

    permission_classes = [IsAdministrateur]

    def get(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        associations = HopitalExamen.objects.filter(hopital=hopital).select_related(
            "examen"
        )

        import openpyxl

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Examens"

        ws.append(["Hôpital", "Examen"])

        for assoc in associations:
            ws.append([hopital.nom, assoc.examen.nom])

        ws.column_dimensions["A"].width = 40
        ws.column_dimensions["B"].width = 30

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="examens_{hopital.nom.replace(" ", "_")}.xlsx"'
        )
        return response


class ExamenMedicalAssociatedHopitauxView(APIView):
    """List all hospitals associated with a specific examen."""
    
    permission_classes = [IsAdministrateur]

    def get(self, request, examen_id):
        examen = get_object_or_404(ExamenMedical, pk=examen_id)
        associations = HopitalExamen.objects.filter(examen=examen).select_related('hopital')
        
        hopitaux_data = []
        for assoc in associations:
            hopitaux_data.append({
                'id': assoc.id,
                'hopital': assoc.hopital.id,
                'hopital_nom': assoc.hopital.nom,
                'hopital_adresse': assoc.hopital.adresse,
            })
        
        return Response(
            {
                "examen": ExamenMedicalSerializer(examen).data,
                "hopitaux": hopitaux_data,
            },
            status=status.HTTP_200_OK,
        )


class ExamenMedicalImportExcelView(APIView):
    """Import examens from Excel file (nom only)."""
    
    permission_classes = [IsAdministrateur]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response(
                {"error": "Aucun fichier fourni."},
                status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES['file']
        
        if not file.name.endswith(('.xlsx', '.xls', '.csv')):
            return Response(
                {"error": "Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            import openpyxl
            import pandas as pd
            
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
            
            if 'nom' not in df.columns and 'Nom' not in df.columns:
                return Response(
                    {"error": "Le fichier doit contenir une colonne 'nom' ou 'Nom'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            nom_column = 'Nom' if 'Nom' in df.columns else 'nom'
            
            created = 0
            skipped = 0
            
            for index, row in df.iterrows():
                nom = str(row[nom_column]).strip()
                
                if not nom or nom.lower() == 'nan':
                    skipped += 1
                    continue
                
                _, created_flag = ExamenMedical.objects.get_or_create(nom=nom)
                
                if created_flag:
                    created += 1
                else:
                    skipped += 1
            
            return Response(
                {
                    "message": f"Import terminé avec succès.",
                    "created": created,
                    "skipped": skipped
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {"error": f"Erreur lors de l'import: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExamenMedicalExportExcelView(APIView):
    """Export all examens to Excel."""
    
    permission_classes = [IsAdministrateur]

    def get(self, request):
        import openpyxl
        
        examens = ExamenMedical.objects.all().order_by('nom')
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Examens"
        
        ws.append(["Nom", "Nombre d'hôpitaux"])
        
        for examen in examens:
            hopital_count = HopitalExamen.objects.filter(examen=examen).count()
            ws.append([examen.nom, hopital_count])
        
        ws.column_dimensions['A'].width = 40
        ws.column_dimensions['B'].width = 20
        
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="examens_export.xlsx"'
        return response


class ExamenMedicalAssociateHopitauxView(APIView):
    """Associate an examen to multiple hopitaux."""
    
    permission_classes = [IsAdministrateur]

    def post(self, request, pk):
        examen = get_object_or_404(ExamenMedical, pk=pk)
        
        hopital_ids = request.data.get('hopital_ids', [])
        action = request.data.get('action', 'add')
        
        if not isinstance(hopital_ids, list):
            return Response(
                {"error": "hopital_ids doit être une liste."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action == 'add':
            created_count = 0
            for hopital_id in hopital_ids:
                try:
                    hopital = Hopital.objects.get(pk=hopital_id)
                    _, created = HopitalExamen.objects.get_or_create(
                        hopital=hopital,
                        examen=examen
                    )
                    if created:
                        created_count += 1
                except Hopital.DoesNotExist:
                    continue
            
            return Response(
                {
                    "message": f"{created_count} nouvelle(s) association(s) créée(s).",
                    "examen": examen.nom,
                    "total_hopitaux": HopitalExamen.objects.filter(examen=examen).count()
                },
                status=status.HTTP_200_OK
            )
        
        elif action == 'remove':
            deleted_count = HopitalExamen.objects.filter(
                examen=examen,
                hopital_id__in=hopital_ids
            ).delete()[0]
            
            return Response(
                {
                    "message": f"{deleted_count} association(s) supprimée(s).",
                    "examen": examen.nom,
                    "total_hopitaux": HopitalExamen.objects.filter(examen=examen).count()
                },
                status=status.HTTP_200_OK
            )
        
        else:
            return Response(
                {"error": "Action invalide. Utilisez 'add' ou 'remove'."},
                status=status.HTTP_400_BAD_REQUEST
            )


class ExamenMedicalBulkDeleteView(APIView):
    """Delete multiple examens at once."""
    
    permission_classes = [IsAdministrateur]

    def post(self, request):
        examen_ids = request.data.get('ids', [])
        
        if not isinstance(examen_ids, list):
            return Response(
                {"error": "ids doit être une liste."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        examens_with_associations = []
        examens_to_delete = []
        
        for examen_id in examen_ids:
            try:
                examen = ExamenMedical.objects.get(pk=examen_id)
                if HopitalExamen.objects.filter(examen=examen).exists():
                    examens_with_associations.append({
                        'id': examen.id,
                        'nom': examen.nom,
                        'hopitaux_count': HopitalExamen.objects.filter(examen=examen).count()
                    })
                else:
                    examens_to_delete.append(examen)
            except ExamenMedical.DoesNotExist:
                continue
        
        force = request.data.get('force', False)
        
        if force:
            HopitalExamen.objects.filter(examen_id__in=examen_ids).delete()
            deleted_count = ExamenMedical.objects.filter(id__in=examen_ids).delete()[0]
            
            return Response(
                {
                    "message": f"{deleted_count} examen(s) supprimé(s) avec leurs associations.",
                    "deleted": deleted_count
                },
                status=status.HTTP_200_OK
            )
        else:
            deleted_count = len(examens_to_delete)
            for examen in examens_to_delete:
                examen.delete()
            
            return Response(
                {
                    "message": f"{deleted_count} examen(s) supprimé(s).",
                    "deleted": deleted_count,
                    "with_associations": examens_with_associations
                },
                status=status.HTTP_200_OK
            )
