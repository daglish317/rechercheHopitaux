from django.urls import path
from .views import TypeHopitalListView, TypeHopitalDetailView

urlpatterns = [
    path("", TypeHopitalListView.as_view(), name="type-hopital-list"),
    path("<int:pk>/", TypeHopitalDetailView.as_view(), name="type-hopital-detail"),
]
