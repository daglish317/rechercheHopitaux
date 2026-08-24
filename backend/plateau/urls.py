from django.urls import path

from .views import (
    HopitalForPlateauView,
    HopitalPlateauTechniqueBulkView,
    HopitalPlateauTechniqueDeleteView,
    HopitalPlateauTechniqueExportExcelView,
    HopitalPlateauTechniqueListView,
    PlateauTechniqueDetailView,
    PlateauTechniqueListView,
)

urlpatterns = [
    path("", PlateauTechniqueListView.as_view(), name="plateau-list"),
    path("<int:pk>/", PlateauTechniqueDetailView.as_view(), name="plateau-detail"),
    path(
        "hopitaux/",
        HopitalForPlateauView.as_view(),
        name="plateau-hopitaux",
    ),
    path(
        "associations/<int:hopital_id>/",
        HopitalPlateauTechniqueListView.as_view(),
        name="hopital-plateau-list",
    ),
    path(
        "associations/<int:hopital_id>/bulk/",
        HopitalPlateauTechniqueBulkView.as_view(),
        name="hopital-plateau-bulk",
    ),
    path(
        "associations/<int:hopital_id>/<int:plateau_id>/",
        HopitalPlateauTechniqueDeleteView.as_view(),
        name="hopital-plateau-delete",
    ),
    path(
        "export/<int:hopital_id>/",
        HopitalPlateauTechniqueExportExcelView.as_view(),
        name="hopital-plateau-export",
    ),
]
