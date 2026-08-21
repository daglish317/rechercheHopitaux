from django.db import models
from hopital.models import Hopital


class PlateauTechnique(models.Model):
    nom = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name = "Plateau technique"
        verbose_name_plural = "Plateaux techniques"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class HopitalPlateauTechnique(models.Model):
    hopital = models.ForeignKey(
        Hopital, on_delete=models.CASCADE, related_name="plateaux_techniques"
    )
    plateau_technique = models.ForeignKey(
        PlateauTechnique, on_delete=models.CASCADE, related_name="hopitaux"
    )

    class Meta:
        verbose_name = "Association hôpital-plateau technique"
        verbose_name_plural = "Associations hôpital-plateau technique"
        unique_together = ["hopital", "plateau_technique"]

    def __str__(self):
        return f"{self.hopital.nom} - {self.plateau_technique.nom}"
