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
