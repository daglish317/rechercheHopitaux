from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404

from .models import ExamenMedical, HopitalExamen
from .serializers import ExamenMedicalSerializer, HopitalExamenSerializer


class ExamenMedicalListView(APIView):
    permission_classes = [IsAdminUser]

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
    permission_classes = [IsAdminUser]

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


class HopitalExamenListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        associations = HopitalExamen.objects.select_related("hopital", "examen").all()
        serializer = HopitalExamenSerializer(associations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HopitalExamenSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HopitalExamenDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(HopitalExamen, pk=pk)

    def delete(self, request, pk):
        association = self.get_object(pk)
        association.delete()
        return Response(
            {"message": "Association supprimée avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )
