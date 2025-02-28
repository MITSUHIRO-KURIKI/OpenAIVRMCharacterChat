from django.urls import path
from .consumers import ThirdPartyGcloudSttTtsConsumer

third_party_gcloud_stt_tts_websocket_urlpatterns = [
    path('ws/third_party/gcloud/stt_tts', ThirdPartyGcloudSttTtsConsumer.as_asgi()),
]