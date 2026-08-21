from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.permissions import IsAdministrateur
from django.shortcuts import get_object_or_404

from .models import Hopital
from .serializers import HopitalSerializer


class HopitalListView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        hopitaux = Hopital.objects.select_related("type_hopital").all()
        serializer = HopitalSerializer(hopitaux, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HopitalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HopitalDetailView(APIView):
    permission_classes = [IsAdministrateur]

    def get_object(self, pk):
        return get_object_or_404(Hopital, pk=pk)

    def get(self, request, pk):
        hopital = self.get_object(pk)
        serializer = HopitalSerializer(hopital)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        hopital = self.get_object(pk)
        serializer = HopitalSerializer(hopital, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HopitalStatutView(APIView):
    permission_classes = [IsAdministrateur]

    def patch(self, request, pk):
        hopital = get_object_or_404(Hopital, pk=pk)
        nouveau_statut = request.data.get("statut")

        if nouveau_statut not in ["ACTIF", "INACTIF"]:
            return Response(
                {"error": "Le statut doit être ACTIF ou INACTIF."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hopital.statut = nouveau_statut
        hopital.save()

        serializer = HopitalSerializer(hopital)
        return Response(serializer.data, status=status.HTTP_200_OK)
