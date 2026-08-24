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

from .models import HopitalPlateauTechnique, PlateauTechnique
from .serializers import (
    BulkHopitalPlateauTechniqueSerializer,
    HopitalLightSerializer,
    HopitalPlateauTechniqueSerializer,
    PlateauTechniqueSerializer,
)


class PlateauTechniqueListView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        plateaux = PlateauTechnique.objects.all()
        serializer = PlateauTechniqueSerializer(plateaux, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlateauTechniqueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlateauTechniqueDetailView(APIView):
    permission_classes = [IsAdministrateur]

    def get_object(self, pk):
        return get_object_or_404(PlateauTechnique, pk=pk)

    def get(self, request, pk):
        plateau = self.get_object(pk)
        serializer = PlateauTechniqueSerializer(plateau)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        plateau = self.get_object(pk)
        serializer = PlateauTechniqueSerializer(plateau, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plateau = self.get_object(pk)

        if HopitalPlateauTechnique.objects.filter(plateau_technique=plateau).exists():
            return Response(
                {
                    "error": "Cet élément ne peut pas être supprimé car il est associé à un ou plusieurs hôpitaux."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        plateau.delete()
        return Response(
            {"message": "Élément supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


class HopitalForPlateauView(APIView):
    """Paginated hospital list with search, for the plateau technique module."""

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


class HopitalPlateauTechniqueListView(APIView):
    """List all associations for a specific hospital."""

    permission_classes = [IsAdministrateur]

    def get(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        associations = HopitalPlateauTechnique.objects.filter(
            hopital=hopital
        ).select_related("plateau_technique")
        serializer = HopitalPlateauTechniqueSerializer(associations, many=True)
        return Response(
            {
                "hopital": HopitalSerializer(hopital).data,
                "plateaux": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class HopitalPlateauTechniqueBulkView(APIView):
    """Bulk set associations for a hospital (replace all)."""

    permission_classes = [IsAdministrateur]

    def post(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        serializer = BulkHopitalPlateauTechniqueSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        plateau_ids = serializer.validated_data["plateaux"]

        existing = set(
            HopitalPlateauTechnique.objects.filter(hopital=hopital).values_list(
                "plateau_technique_id", flat=True
            )
        )
        new = set(plateau_ids) - existing
        to_remove = existing - set(plateau_ids)

        HopitalPlateauTechnique.objects.filter(
            hopital=hopital, plateau_technique_id__in=to_remove
        ).delete()
        HopitalPlateauTechnique.objects.bulk_create(
            [
                HopitalPlateauTechnique(hopital=hopital, plateau_technique_id=pid)
                for pid in new
            ],
            ignore_conflicts=True,
        )

        return Response(
            {"message": "Associations enregistrées avec succès."},
            status=status.HTTP_200_OK,
        )


class HopitalPlateauTechniqueDeleteView(APIView):
    """Delete a single association."""

    permission_classes = [IsAdministrateur]

    def delete(self, request, hopital_id, plateau_id):
        association = HopitalPlateauTechnique.objects.filter(
            hopital_id=hopital_id, plateau_technique_id=plateau_id
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


class HopitalPlateauTechniqueExportExcelView(APIView):
    """Export plateaux techniques for a single hospital as Excel."""

    permission_classes = [IsAdministrateur]

    def get(self, request, hopital_id):
        hopital = get_object_or_404(Hopital, pk=hopital_id)
        associations = HopitalPlateauTechnique.objects.filter(
            hopital=hopital
        ).select_related("plateau_technique")

        import openpyxl

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Plateau Technique"

        ws.append(["Hôpital", "Plateau Technique"])

        for assoc in associations:
            ws.append([hopital.nom, assoc.plateau_technique.nom])

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
            f'attachment; filename="plateau_technique_{hopital.nom.replace(" ", "_")}.xlsx"'
        )
        return response
