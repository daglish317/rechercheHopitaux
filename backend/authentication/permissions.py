from rest_framework.permissions import BasePermission


class IsAdministrateur(BasePermission):
    message = "Acces reserve aux administrateurs."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "role", None) == "ADMINISTRATEUR" or user.is_staff)
        )
