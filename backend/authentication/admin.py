from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UtilisateurAdmin(UserAdmin):
    model = User
    list_display = ("nom", "email", "role", "date_creation", "is_active")
    list_filter = ("role", "is_active")
    search_fields = ("nom", "email")
    ordering = ("-date_creation",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informations personnelles", {"fields": ("nom", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("nom", "email", "role", "password1", "password2"),
            },
        ),
    )
    filter_horizontal = ()
