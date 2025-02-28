from django.urls import path
from .consumers import VrmchatConsumer

vrmchat_websocket_urlpatterns = [
    path('ws/vrmchat/room/<str:room_id>', VrmchatConsumer.as_asgi()),
]