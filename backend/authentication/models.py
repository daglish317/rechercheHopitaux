from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, nom, email, password=None, **extra_fields):
        if not nom:
            raise ValueError("Le nom est obligatoire.")
        if not email:
            raise ValueError("L'email est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(nom=nom, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, nom, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "ADMINISTRATEUR")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(nom, email, password, **extra_fields)


class Utilisateur(AbstractBaseUser):
    ROLE_CHOICES = [
        ("UTILISATEUR", "Utilisateur"),
        ("ADMINISTRATEUR", "Administrateur"),
    ]

    nom = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="UTILISATEUR")
    photo = models.ImageField(upload_to="profiles/", blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nom"]

    def __str__(self):
        return f"{self.nom} ({self.role})"
