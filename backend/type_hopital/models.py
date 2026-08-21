from django.db import models


class TypeHopital(models.Model):
    nom = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name = "Type d'hôpital"
        verbose_name_plural = "Types d'hôpitaux"
        ordering = ["nom"]

    def __str__(self):
        return self.nom
