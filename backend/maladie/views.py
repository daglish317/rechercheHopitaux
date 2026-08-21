from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.permissions import IsAdministrateur
from django.shortcuts import get_object_or_404

from .models import Maladie
from .serializers import MaladieSerializer


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

        if hasattr(maladie, "prises_en_charge") and maladie.prises_en_charge.exists():
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
