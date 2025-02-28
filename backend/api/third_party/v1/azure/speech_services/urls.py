from django.urls import path
from .viewsets import getTokenOrRefreshViewSet

app_name = 'api.third_party.v1.azure.speech_services'

urlpatterns = [
    path('get_or_refresh/', getTokenOrRefreshViewSet.as_view(), name='get_or_refresh'),
]