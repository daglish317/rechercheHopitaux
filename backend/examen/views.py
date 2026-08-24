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
