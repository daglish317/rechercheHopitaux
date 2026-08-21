from rest_framework import serializers
from .models import TypeHopital


class TypeHopitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeHopital
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

        if TypeHopital.objects.filter(nom__iexact=nom).exists():
            raise serializers.ValidationError(
                {"nom": "Un type avec ce nom existe déjà."}
            )

        attrs["nom"] = nom
        return attrs
