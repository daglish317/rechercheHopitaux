from django.urls import path
from .views import MaladieListView, MaladieDetailView

urlpatterns = [
    path("", MaladieListView.as_view(), name="maladie-list"),
    path("<int:pk>/", MaladieDetailView.as_view(), name="maladie-detail"),
]
