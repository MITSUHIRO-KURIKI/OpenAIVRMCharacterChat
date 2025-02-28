from django.urls import include, path

app_name = 'api.third_party.v1.azure'

urlpatterns = [
    path('speech_services/', include('api.third_party.v1.azure.speech_services.urls')),
]