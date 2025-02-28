from django.urls import include, path

app_name = 'api.third_party.v1'

urlpatterns = [
    path('azure/', include('api.third_party.v1.azure.urls')),
]