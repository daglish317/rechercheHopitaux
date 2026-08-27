from django.urls import path
from .views import (
    MaladieListView,
    MaladieDetailView,
    HopitalForMaladiesView,
    PriseEnChargeListView,
    PriseEnChargeBulkView,
    PriseEnChargeDeleteView,
    PriseEnChargeExportExcelView,
    MaladieImportExcelView,
    MaladieExportExcelView,
    MaladieAssociateHopitauxView,
    MaladieBulkDeleteView,
    MaladieAssociatedHopitauxView,
)

urlpatterns = [
    path("", MaladieListView.as_view(), name="maladie-list"),
    path("<int:pk>/", MaladieDetailView.as_view(), name="maladie-detail"),
    path(
        "hopitaux/",
        HopitalForMaladiesView.as_view(),
        name="maladie-hopitaux",
    ),
    path(
        "associations/<int:hopital_id>/",
        PriseEnChargeListView.as_view(),
        name="prise-en-charge-list",
    ),
    path(
        "associations/maladie/<int:maladie_id>/",
        MaladieAssociatedHopitauxView.as_view(),
        name="maladie-associated-hopitaux",
    ),
    path(
        "associations/<int:hopital_id>/bulk/",
        PriseEnChargeBulkView.as_view(),
        name="prise-en-charge-bulk",
    ),
    path(
        "associations/<int:hopital_id>/<int:maladie_id>/",
        PriseEnChargeDeleteView.as_view(),
        name="prise-en-charge-delete",
    ),
    path(
        "export/<int:hopital_id>/",
        PriseEnChargeExportExcelView.as_view(),
        name="prise-en-charge-export",
    ),
    # Nouvelles routes
    path(
        "import/",
        MaladieImportExcelView.as_view(),
        name="maladie-import",
    ),
    path(
        "export-all/",
        MaladieExportExcelView.as_view(),
        name="maladie-export-all",
    ),
    path(
        "<int:pk>/associate-hopitaux/",
        MaladieAssociateHopitauxView.as_view(),
        name="maladie-associate-hopitaux",
    ),
    path(
        "bulk-delete/",
        MaladieBulkDeleteView.as_view(),
        name="maladie-bulk-delete",
    ),
]
