from rest_framework import serializers
from .models import Maladie


class MaladieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maladie
        fields = ["id", "nom"]

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        return value.strip()

    def validate(self, attrs):
        nom = attrs.get("nom", "").strip()
        instance = self.instance

        if instance and instance.nom == nom:
            return attrs

        if Maladie.objects.filter(nom__iexact=nom).exists():
            raise serializers.ValidationError(
                {"nom": "Une maladie avec ce nom existe déjà."}
            )

        attrs["nom"] = nom
        return attrs
