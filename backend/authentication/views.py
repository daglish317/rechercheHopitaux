from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Compte créé avec succès.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["motDePasse"]

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Identifiants incorrects."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {"message": "Déconnexion réussie."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "Erreur lors de la déconnexion."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfilePhotoView(APIView):
    permission_classes = [IsAuthenticated]
    max_photo_size = 2 * 1024 * 1024
    allowed_photo_types = {"image/jpeg", "image/png", "image/webp"}

    def put(self, request):
        photo = request.FILES.get("photo")
        if not photo:
            return Response(
                {"error": "Aucune photo fournie."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if photo.size > self.max_photo_size:
            return Response(
                {"error": "La photo ne doit pas depasser 2 Mo."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if getattr(photo, "content_type", None) not in self.allowed_photo_types:
            return Response(
                {"error": "Format accepte: JPG, PNG ou WebP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        if user.photo:
            user.photo.delete(save=False)
        user.photo = photo
        user.save()

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        if user.photo:
            user.photo.delete(save=False)
            user.photo = None
            user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        ancien_mot_de_passe = serializer.validated_data["ancien_mot_de_passe"]
        nouveau_mot_de_passe = serializer.validated_data["nouveau_mot_de_passe"]

        if not user.check_password(ancien_mot_de_passe):
            return Response(
                {"ancien_mot_de_passe": "L'ancien mot de passe est incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(nouveau_mot_de_passe)
        user.save()

        return Response(
            {"message": "Mot de passe modifié avec succès."},
            status=status.HTTP_200_OK,
        )
