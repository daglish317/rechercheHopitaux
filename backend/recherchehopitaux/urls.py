from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication.urls")),
    path("api/types-hopitaux/", include("type_hopital.urls")),
    path("api/hopitaux/", include("hopital.urls")),
    path("api/maladies/", include("maladie.urls")),
    path("api/examens/", include("examen.urls")),
    path("api/plateau-technique/", include("plateau.urls")),
    path("api/", include("public.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
