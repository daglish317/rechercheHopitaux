from rest_framework import serializers
from hopital.models import Hopital


class HopitalSearchSerializer(serializers.ModelSerializer):
    type_hopital_nom = serializers.CharField(source="type_hopital.nom", read_only=True)

    class Meta:
        model = Hopital
        fields = [
            "id",
            "nom",
            "type_hopital_nom",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
        ]


class HopitalDetailSerializer(serializers.ModelSerializer):
    type_hopital_nom = serializers.CharField(source="type_hopital.nom", read_only=True)
    maladies = serializers.SerializerMethodField()
    examens = serializers.SerializerMethodField()
    plateaux_techniques = serializers.SerializerMethodField()

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
            "maladies",
            "examens",
            "plateaux_techniques",
        ]

    def get_maladies(self, obj):
        from maladie.models import Maladie

        maladies = Maladie.objects.filter(
            prises_en_charge__hopital=obj
        ).values_list("nom", flat=True)
        return list(maladies)

    def get_examens(self, obj):
        return list(
            obj.examens.select_related("examen")
            .values_list("examen__nom", flat=True)
        )

    def get_plateaux_techniques(self, obj):
        return list(
            obj.plateaux_techniques.select_related("plateau_technique").values_list(
                "plateau_technique__nom", flat=True
            )
        )
