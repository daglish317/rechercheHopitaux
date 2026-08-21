from rest_framework import serializers
from .models import PlateauTechnique, HopitalPlateauTechnique


class PlateauTechniqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlateauTechnique
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

        if PlateauTechnique.objects.filter(nom__iexact=nom).exists():
            raise serializers.ValidationError(
                {"nom": "Un élément avec ce nom existe déjà."}
            )

        attrs["nom"] = nom
        return attrs


class HopitalPlateauTechniqueSerializer(serializers.ModelSerializer):
    hopital_nom = serializers.CharField(source="hopital.nom", read_only=True)
    plateau_technique_nom = serializers.CharField(
        source="plateau_technique.nom", read_only=True
    )

    class Meta:
        model = HopitalPlateauTechnique
        fields = [
            "id",
            "hopital",
            "hopital_nom",
            "plateau_technique",
            "plateau_technique_nom",
        ]

    def validate(self, attrs):
        hopital = attrs.get("hopital")
        plateau_technique = attrs.get("plateau_technique")
        instance = self.instance

        if hopital and plateau_technique:
            if (
                instance
                and instance.hopital == hopital
                and instance.plateau_technique == plateau_technique
            ):
                return attrs

            if HopitalPlateauTechnique.objects.filter(
                hopital=hopital, plateau_technique=plateau_technique
            ).exists():
                raise serializers.ValidationError(
                    "Cette association existe déjà."
                )

        return attrs
