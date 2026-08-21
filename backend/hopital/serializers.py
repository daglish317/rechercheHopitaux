from rest_framework import serializers
from .models import Hopital


class HopitalSerializer(serializers.ModelSerializer):
    type_hopital_nom = serializers.CharField(source="type_hopital.nom", read_only=True)

    class Meta:
        model = Hopital
        fields = [
            "id",
            "nom",
            "type_hopital",
            "type_hopital_nom",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
            "statut",
        ]

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        return value.strip()

    def validate_adresse(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("L'adresse est obligatoire.")
        return value.strip()

    def validate_latitude(self, value):
        try:
            lat = float(value)
            if lat < -90 or lat > 90:
                raise serializers.ValidationError(
                    "La latitude doit être entre -90 et 90."
                )
        except (TypeError, ValueError):
            raise serializers.ValidationError("La latitude doit être une valeur numérique.")
        return value

    def validate_longitude(self, value):
        try:
            lng = float(value)
            if lng < -180 or lng > 180:
                raise serializers.ValidationError(
                    "La longitude doit être entre -180 et 180."
                )
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                "La longitude doit être une valeur numérique."
            )
        return value

    def validate_statut(self, value):
        valid_choices = ["ACTIF", "INACTIF"]
        if value not in valid_choices:
            raise serializers.ValidationError(
                "Le statut doit être ACTIF ou INACTIF."
            )
        return value
