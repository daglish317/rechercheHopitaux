from django.urls import path
from .views import (
    ExamenMedicalListView,
    ExamenMedicalDetailView,
    HopitalExamenListView,
    HopitalExamenDetailView,
)

urlpatterns = [
    path("", ExamenMedicalListView.as_view(), name="examen-list"),
    path("<int:pk>/", ExamenMedicalDetailView.as_view(), name="examen-detail"),
    path("associations/", HopitalExamenListView.as_view(), name="hopital-examen-list"),
    path("associations/<int:pk>/", HopitalExamenDetailView.as_view(), name="hopital-examen-detail"),
]
