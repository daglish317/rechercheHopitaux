from rest_framework import serializers

from hopital.models import Hopital

from .models import Maladie, PriseEnCharge


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
            raise serializers.ValidationError({"nom": "Une maladie avec ce nom existe déjà."})

        attrs["nom"] = nom
        return attrs


class PriseEnChargeSerializer(serializers.ModelSerializer):
    hopital_nom = serializers.CharField(source="hopital.nom", read_only=True)
    maladie_nom = serializers.CharField(source="maladie.nom", read_only=True)

    class Meta:
        model = PriseEnCharge
        fields = ["id", "hopital", "hopital_nom", "maladie", "maladie_nom"]

    def validate(self, attrs):
        hopital = attrs.get("hopital")
        maladie = attrs.get("maladie")
        instance = self.instance

        if hopital and maladie:
            if instance and instance.hopital == hopital and instance.maladie == maladie:
                return attrs

            if PriseEnCharge.objects.filter(hopital=hopital, maladie=maladie).exists():
                raise serializers.ValidationError("Cette association existe déjà.")

        return attrs


class HopitalLightSerializer(serializers.ModelSerializer):
    type_hopital_nom = serializers.CharField(source="type_hopital.nom", read_only=True)

    class Meta:
        model = Hopital
        fields = ["id", "nom", "type_hopital_nom"]


class BulkPriseEnChargeSerializer(serializers.Serializer):
    maladies = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True,
        help_text="Liste des IDs de maladies à associer.",
    )

    def validate_maladies(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                "Une maladie ne peut être associée qu'une seule fois au même hôpital."
            )

        existing = Maladie.objects.filter(id__in=value).values_list("id", flat=True)
        missing = set(value) - set(existing)
        if missing:
            raise serializers.ValidationError(
                f"Maladies introuvables : {', '.join(str(i) for i in sorted(missing))}"
            )
        return value
