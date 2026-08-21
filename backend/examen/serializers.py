from rest_framework import serializers
from .models import ExamenMedical, HopitalExamen


class ExamenMedicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamenMedical
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

        if ExamenMedical.objects.filter(nom__iexact=nom).exists():
            raise serializers.ValidationError(
                {"nom": "Un examen avec ce nom existe déjà."}
            )

        attrs["nom"] = nom
        return attrs


class HopitalExamenSerializer(serializers.ModelSerializer):
    hopital_nom = serializers.CharField(source="hopital.nom", read_only=True)
    examen_nom = serializers.CharField(source="examen.nom", read_only=True)

    class Meta:
        model = HopitalExamen
        fields = ["id", "hopital", "hopital_nom", "examen", "examen_nom"]

    def validate(self, attrs):
        hopital = attrs.get("hopital")
        examen = attrs.get("examen")
        instance = self.instance

        if hopital and examen:
            if instance and instance.hopital == hopital and instance.examen == examen:
                return attrs

            if HopitalExamen.objects.filter(hopital=hopital, examen=examen).exists():
                raise serializers.ValidationError(
                    "Cette association existe déjà."
                )

        return attrs
