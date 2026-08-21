from django.db import models
from hopital.models import Hopital


class ExamenMedical(models.Model):
    nom = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name = "Examen médical"
        verbose_name_plural = "Examens médicaux"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class HopitalExamen(models.Model):
    hopital = models.ForeignKey(
        Hopital, on_delete=models.CASCADE, related_name="examens"
    )
    examen = models.ForeignKey(
        ExamenMedical, on_delete=models.CASCADE, related_name="hopitaux"
    )

    class Meta:
        verbose_name = "Association hôpital-examen"
        verbose_name_plural = "Associations hôpital-examen"
        unique_together = ["hopital", "examen"]

    def __str__(self):
        return f"{self.hopital.nom} - {self.examen.nom}"
