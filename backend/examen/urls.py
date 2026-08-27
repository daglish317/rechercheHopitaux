from django.urls import path

from .views import (
    ExamenMedicalDetailView,
    ExamenMedicalListView,
    HopitalExamenBulkView,
    HopitalExamenDeleteView,
    HopitalExamenExportExcelView,
    HopitalExamenListView,
    HopitalForExamensView,
    ExamenMedicalImportExcelView,
    ExamenMedicalExportExcelView,
    ExamenMedicalAssociateHopitauxView,
    ExamenMedicalBulkDeleteView,
    ExamenMedicalAssociatedHopitauxView,
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
        "associations/examen/<int:examen_id>/",
        ExamenMedicalAssociatedHopitauxView.as_view(),
        name="examen-associated-hopitaux",
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
    # Nouvelles routes
    path(
        "import/",
        ExamenMedicalImportExcelView.as_view(),
        name="examen-import",
    ),
    path(
        "export-all/",
        ExamenMedicalExportExcelView.as_view(),
        name="examen-export-all",
    ),
    path(
        "<int:pk>/associate-hopitaux/",
        ExamenMedicalAssociateHopitauxView.as_view(),
        name="examen-associate-hopitaux",
    ),
    path(
        "bulk-delete/",
        ExamenMedicalBulkDeleteView.as_view(),
        name="examen-bulk-delete",
    ),
]
