from django.urls import path
from .views import HopitalListView, HopitalDetailView, HopitalStatutView

urlpatterns = [
    path("", HopitalListView.as_view(), name="hopital-list"),
    path("<int:pk>/", HopitalDetailView.as_view(), name="hopital-detail"),
    path("<int:pk>/statut/", HopitalStatutView.as_view(), name="hopital-statut"),
]
