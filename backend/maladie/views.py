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

from .models import Maladie, PriseEnCharge
from .serializers import (
    BulkPriseEnChargeSerializer,
    HopitalLightSerializer,
    MaladieSerializer,
    PriseEnChargeSerializer,
)


class MaladieListView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        maladies = Maladie.objects.all()
        serializer = MaladieSerializer(maladies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MaladieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaladieDetailView(APIView):
    permission_classes = [IsAdministrateur]

    def get_object(self, pk):
        return get_object_or_404(Maladie, pk=pk)

    def get(self, request, pk):
        maladie = self.get_object(pk)
        serializer = MaladieSerializer(maladie)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        maladie = self.get_object(pk)
        serializer = MaladieSerializer(maladie, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        maladie = self.get_object(pk)

        if PriseEnCharge.objects.filter(maladie=maladie).exists():
            return Response(
                {
                    "error": "Cette maladie ne peut pas être supprimée car elle est utilisée dans une ou plusieurs prises en charge."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        maladie.delete()
        return Response(
            {"message": "Maladie supprimée avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


class HopitalForMaladiesView(APIView):
    """Paginated hospital list with search, for the maladies module."""

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


class PriseEnChargeListView(APIView):
    """List all associations for a specific hospital."""

    permission_classes = [IsAdministrateur]

    def get(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        associations = PriseEnCharge.objects.filter(hopital=hopital).select_related(
            "maladie"
        )
        serializer = PriseEnChargeSerializer(associations, many=True)
        return Response(
            {
                "hopital": HopitalSerializer(hopital).data,
                "maladies": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class PriseEnChargeBulkView(APIView):
    """Bulk set associations for a hospital (replace all)."""

    permission_classes = [IsAdministrateur]

    def post(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        serializer = BulkPriseEnChargeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        maladie_ids = serializer.validated_data["maladies"]

        existing = set(
            PriseEnCharge.objects.filter(hopital=hopital).values_list(
                "maladie_id", flat=True
            )
        )
        new = set(maladie_ids) - existing
        to_remove = existing - set(maladie_ids)

        PriseEnCharge.objects.filter(hopital=hopital, maladie_id__in=to_remove).delete()
        PriseEnCharge.objects.bulk_create(
            [PriseEnCharge(hopital=hopital, maladie_id=mid) for mid in new],
            ignore_conflicts=True,
        )

        return Response(
            {"message": "Associations enregistrées avec succès."},
            status=status.HTTP_200_OK,
        )


class PriseEnChargeDeleteView(APIView):
    """Delete a single association."""

    permission_classes = [IsAdministrateur]

    def delete(self, request, hopital_id, maladie_id):
        association = PriseEnCharge.objects.filter(
            hopital_id=hopital_id, maladie_id=maladie_id
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


class PriseEnChargeExportExcelView(APIView):
    """Export maladies for a single hospital as Excel."""

    permission_classes = [IsAdministrateur]

    def get(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        associations = PriseEnCharge.objects.filter(hopital=hopital).select_related(
            "maladie"
        )

        import openpyxl

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Maladies"

        ws.append(["Hôpital", "Maladie"])

        for assoc in associations:
            ws.append([hopital.nom, assoc.maladie.nom])

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
            f'attachment; filename="maladies_{hopital.nom.replace(" ", "_")}.xlsx"'
        )
        return response


class MaladieAssociatedHopitauxView(APIView):
    """List all hospitals associated with a specific maladie."""
    
    permission_classes = [IsAdministrateur]

    def get(self, request, maladie_id):
        maladie = get_object_or_404(Maladie, pk=maladie_id)
        associations = PriseEnCharge.objects.filter(maladie=maladie).select_related('hopital')
        
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
                "maladie": MaladieSerializer(maladie).data,
                "hopitaux": hopitaux_data,
            },
            status=status.HTTP_200_OK,
        )


class MaladieImportExcelView(APIView):
    """Import maladies from Excel file (nom only)."""
    
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
            
            # Lire le fichier selon le format
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
            
            # Vérifier que la colonne 'nom' existe
            if 'nom' not in df.columns and 'Nom' not in df.columns:
                return Response(
                    {"error": "Le fichier doit contenir une colonne 'nom' ou 'Nom'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Normaliser le nom de la colonne
            nom_column = 'Nom' if 'Nom' in df.columns else 'nom'
            
            created = 0
            skipped = 0
            errors = []
            
            for index, row in df.iterrows():
                nom = str(row[nom_column]).strip()
                
                if not nom or nom.lower() == 'nan':
                    skipped += 1
                    continue
                
                # Créer ou ignorer si existe déjà
                _, created_flag = Maladie.objects.get_or_create(nom=nom)
                
                if created_flag:
                    created += 1
                else:
                    skipped += 1
            
            return Response(
                {
                    "message": f"Import terminé avec succès.",
                    "created": created,
                    "skipped": skipped,
                    "errors": errors
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {"error": f"Erreur lors de l'import: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MaladieExportExcelView(APIView):
    """Export all maladies to Excel."""
    
    permission_classes = [IsAdministrateur]

    def get(self, request):
        import openpyxl
        
        maladies = Maladie.objects.all().order_by('nom')
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Maladies"
        
        # En-têtes
        ws.append(["Nom", "Nombre d'hôpitaux"])
        
        # Données
        for maladie in maladies:
            hopital_count = PriseEnCharge.objects.filter(maladie=maladie).count()
            ws.append([maladie.nom, hopital_count])
        
        # Ajuster la largeur des colonnes
        ws.column_dimensions['A'].width = 40
        ws.column_dimensions['B'].width = 20
        
        # Sauvegarder dans un buffer
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="maladies_export.xlsx"'
        return response


class MaladieAssociateHopitauxView(APIView):
    """Associate a maladie to multiple hopitaux."""
    
    permission_classes = [IsAdministrateur]

    def post(self, request, pk):
        maladie = get_object_or_404(Maladie, pk=pk)
        
        hopital_ids = request.data.get('hopital_ids', [])
        action = request.data.get('action', 'add')  # 'add' or 'remove'
        
        if not isinstance(hopital_ids, list):
            return Response(
                {"error": "hopital_ids doit être une liste."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action == 'add':
            # Ajouter les associations
            created_count = 0
            for hopital_id in hopital_ids:
                try:
                    hopital = Hopital.objects.get(pk=hopital_id)
                    _, created = PriseEnCharge.objects.get_or_create(
                        hopital=hopital,
                        maladie=maladie
                    )
                    if created:
                        created_count += 1
                except Hopital.DoesNotExist:
                    continue
            
            return Response(
                {
                    "message": f"{created_count} nouvelle(s) association(s) créée(s).",
                    "maladie": maladie.nom,
                    "total_hopitaux": PriseEnCharge.objects.filter(maladie=maladie).count()
                },
                status=status.HTTP_200_OK
            )
        
        elif action == 'remove':
            # Supprimer les associations
            deleted_count = PriseEnCharge.objects.filter(
                maladie=maladie,
                hopital_id__in=hopital_ids
            ).delete()[0]
            
            return Response(
                {
                    "message": f"{deleted_count} association(s) supprimée(s).",
                    "maladie": maladie.nom,
                    "total_hopitaux": PriseEnCharge.objects.filter(maladie=maladie).count()
                },
                status=status.HTTP_200_OK
            )
        
        else:
            return Response(
                {"error": "Action invalide. Utilisez 'add' ou 'remove'."},
                status=status.HTTP_400_BAD_REQUEST
            )


class MaladieBulkDeleteView(APIView):
    """Delete multiple maladies at once."""
    
    permission_classes = [IsAdministrateur]

    def post(self, request):
        maladie_ids = request.data.get('ids', [])
        
        if not isinstance(maladie_ids, list):
            return Response(
                {"error": "ids doit être une liste."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier les maladies qui ont des associations
        maladies_with_associations = []
        maladies_to_delete = []
        
        for maladie_id in maladie_ids:
            try:
                maladie = Maladie.objects.get(pk=maladie_id)
                if PriseEnCharge.objects.filter(maladie=maladie).exists():
                    maladies_with_associations.append({
                        'id': maladie.id,
                        'nom': maladie.nom,
                        'hopitaux_count': PriseEnCharge.objects.filter(maladie=maladie).count()
                    })
                else:
                    maladies_to_delete.append(maladie)
            except Maladie.DoesNotExist:
                continue
        
        # Option pour forcer la suppression
        force = request.data.get('force', False)
        
        if force:
            # Supprimer toutes les associations d'abord
            PriseEnCharge.objects.filter(maladie_id__in=maladie_ids).delete()
            # Puis supprimer les maladies
            deleted_count = Maladie.objects.filter(id__in=maladie_ids).delete()[0]
            
            return Response(
                {
                    "message": f"{deleted_count} maladie(s) supprimée(s) avec leurs associations.",
                    "deleted": deleted_count
                },
                status=status.HTTP_200_OK
            )
        else:
            # Supprimer uniquement les maladies sans associations
            deleted_count = len(maladies_to_delete)
            for maladie in maladies_to_delete:
                maladie.delete()
            
            return Response(
                {
                    "message": f"{deleted_count} maladie(s) supprimée(s).",
                    "deleted": deleted_count,
                    "with_associations": maladies_with_associations
                },
                status=status.HTTP_200_OK
            )
