from django.db import models
from type_hopital.models import TypeHopital


class Hopital(models.Model):
    STATUT_CHOICES = [
        ("ACTIF", "Actif"),
        ("INACTIF", "Inactif"),
    ]

    nom = models.CharField(max_length=255)
    type_hopital = models.ForeignKey(
        TypeHopital, on_delete=models.PROTECT, related_name="hopitaux"
    )
    adresse = models.CharField(max_length=500)
    telephone = models.CharField(max_length=20, blank=True, default="")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=7, null=True, blank=True)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default="ACTIF")

    class Meta:
        verbose_name = "Hôpital"
        verbose_name_plural = "Hôpitaux"
        ordering = ["nom"]

    def __str__(self):
        return f"{self.nom} ({self.get_statut_display()})"
