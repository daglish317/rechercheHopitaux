from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.permissions import IsAdministrateur
from django.shortcuts import get_object_or_404

from .models import PlateauTechnique, HopitalPlateauTechnique
from .serializers import (
    PlateauTechniqueSerializer,
    HopitalPlateauTechniqueSerializer,
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


class HopitalPlateauTechniqueListView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        associations = HopitalPlateauTechnique.objects.select_related(
            "hopital", "plateau_technique"
        ).all()
        serializer = HopitalPlateauTechniqueSerializer(associations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HopitalPlateauTechniqueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HopitalPlateauTechniqueDetailView(APIView):
    permission_classes = [IsAdministrateur]

    def get_object(self, pk):
        return get_object_or_404(HopitalPlateauTechnique, pk=pk)

    def delete(self, request, pk):
        association = self.get_object(pk)
        association.delete()
        return Response(
            {"message": "Association supprimée avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )
