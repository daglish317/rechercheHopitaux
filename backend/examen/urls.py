from django.urls import path

from .views import (
    ExamenMedicalDetailView,
    ExamenMedicalListView,
    HopitalExamenBulkView,
    HopitalExamenDeleteView,
    HopitalExamenExportExcelView,
    HopitalExamenListView,
    HopitalForExamensView,
)

urlpatterns = [
    path("", ExamenMedicalListView.as_view(), name="examen-list"),
    path("<int:pk>/", ExamenMedicalDetailView.as_view(), name="examen-detail"),
    path(
        "hopitaux/",
        HopitalForExamensView.as_view(),
        name="examen-hopitaux",
    ),
    path(
        "associations/<int:hopital_id>/",
        HopitalExamenListView.as_view(),
        name="hopital-examen-list",
    ),
    path(
        "associations/<int:hopital_id>/bulk/",
        HopitalExamenBulkView.as_view(),
        name="hopital-examen-bulk",
    ),
    path(
        "associations/<int:hopital_id>/<int:examen_id>/",
        HopitalExamenDeleteView.as_view(),
        name="hopital-examen-delete",
    ),
    path(
        "export/<int:hopital_id>/",
        HopitalExamenExportExcelView.as_view(),
        name="hopital-examen-export",
    ),
]
