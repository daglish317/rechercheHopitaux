from django.db import models


class Maladie(models.Model):
    nom = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name = "Maladie"
        verbose_name_plural = "Maladies"
        ordering = ["nom"]

    def __str__(self):
        return self.nom
