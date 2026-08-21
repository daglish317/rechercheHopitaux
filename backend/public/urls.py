from django.urls import path
from .views import HopitalSearchView, HopitalPublicDetailView

urlpatterns = [
    path("search/", HopitalSearchView.as_view(), name="hopital-search"),
    path("hopitaux/<int:pk>/", HopitalPublicDetailView.as_view(), name="hopital-public-detail"),
]
