from django.db import models
from hopital.models import Hopital


class Maladie(models.Model):
    nom = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name = "Maladie"
        verbose_name_plural = "Maladies"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class PriseEnCharge(models.Model):
    hopital = models.ForeignKey(
        Hopital, on_delete=models.CASCADE, related_name="prises_en_charge"
    )
    maladie = models.ForeignKey(
        Maladie, on_delete=models.CASCADE, related_name="prises_en_charge"
    )

    class Meta:
        verbose_name = "Prise en charge"
        verbose_name_plural = "Prises en charge"
        unique_together = ["hopital", "maladie"]

    def __str__(self):
        return f"{self.hopital.nom} - {self.maladie.nom}"
