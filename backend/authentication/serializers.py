from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    motDePasse = serializers.CharField(write_only=True, min_length=1)

    class Meta:
        model = User
        fields = ["id", "nom", "email", "motDePasse"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            nom=validated_data["nom"],
            email=validated_data["email"],
            password=validated_data["motDePasse"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    motDePasse = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "nom", "email", "role", "photo", "date_creation"]
        read_only_fields = ["id", "role", "date_creation"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["nom", "email"]

    def validate_email(self, value):
        user = self.context["request"].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
        return value

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom ne doit pas être vide.")
        return value.strip()


class ChangePasswordSerializer(serializers.Serializer):
    ancien_mot_de_passe = serializers.CharField()
    nouveau_mot_de_passe = serializers.CharField(min_length=1)
    confirmation = serializers.CharField()

    def validate(self, attrs):
        if attrs["nouveau_mot_de_passe"] != attrs["confirmation"]:
            raise serializers.ValidationError(
                {"confirmation": "Les mots de passe ne correspondent pas."}
            )
        return attrs
