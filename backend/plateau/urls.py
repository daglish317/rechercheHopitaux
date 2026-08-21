from django.urls import path
from .views import (
    PlateauTechniqueListView,
    PlateauTechniqueDetailView,
    HopitalPlateauTechniqueListView,
    HopitalPlateauTechniqueDetailView,
)

urlpatterns = [
    path("", PlateauTechniqueListView.as_view(), name="plateau-list"),
    path("<int:pk>/", PlateauTechniqueDetailView.as_view(), name="plateau-detail"),
    path(
        "associations/",
        HopitalPlateauTechniqueListView.as_view(),
        name="hopital-plateau-list",
    ),
    path(
        "associations/<int:pk>/",
        HopitalPlateauTechniqueDetailView.as_view(),
        name="hopital-plateau-detail",
    ),
]
