from django.urls import path
from .views import (
    MaladieListView,
    MaladieDetailView,
    HopitalForMaladiesView,
    PriseEnChargeListView,
    PriseEnChargeBulkView,
    PriseEnChargeDeleteView,
    PriseEnChargeExportExcelView,
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
]
