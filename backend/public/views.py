from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404

from hopital.models import Hopital
from .serializers import HopitalSearchSerializer, HopitalDetailSerializer


class HopitalSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response([], status=status.HTTP_200_OK)

        hopitaux = (
            Hopital.objects.select_related("type_hopital")
            .filter(statut="ACTIF")
            .filter(
                Q(nom__icontains=query)
                | Q(adresse__icontains=query)
                | Q(type_hopital__nom__icontains=query)
                | Q(examens__examen__nom__icontains=query)
                | Q(plateaux_techniques__plateau_technique__nom__icontains=query)
            )
            .distinct()
        )

        serializer = HopitalSearchSerializer(hopitaux, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HopitalPublicDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        hopital = get_object_or_404(
            Hopital.objects.select_related("type_hopital"), pk=pk
        )
        serializer = HopitalDetailSerializer(hopital)
        return Response(serializer.data, status=status.HTTP_200_OK)
