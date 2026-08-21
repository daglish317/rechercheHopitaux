from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.permissions import IsAdministrateur
from django.shortcuts import get_object_or_404

from .models import TypeHopital
from .serializers import TypeHopitalSerializer


class TypeHopitalListView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        types = TypeHopital.objects.all()
        serializer = TypeHopitalSerializer(types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TypeHopitalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TypeHopitalDetailView(APIView):
    permission_classes = [IsAdministrateur]

    def get_object(self, pk):
        return get_object_or_404(TypeHopital, pk=pk)

    def get(self, request, pk):
        type_hopital = self.get_object(pk)
        serializer = TypeHopitalSerializer(type_hopital)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        type_hopital = self.get_object(pk)
        serializer = TypeHopitalSerializer(type_hopital, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        type_hopital = self.get_object(pk)

        if hasattr(type_hopital, "hopitaux") and type_hopital.hopitaux.exists():
            return Response(
                {
                    "error": "Ce type ne peut pas être supprimé car il est utilisé par un ou plusieurs hôpitaux."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        type_hopital.delete()
        return Response(
            {"message": "Type supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )
