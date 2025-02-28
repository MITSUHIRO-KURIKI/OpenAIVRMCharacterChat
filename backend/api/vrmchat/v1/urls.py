from django.urls import path
from .viewsets import (
    RoomCreateViewSet, RoomDeleteViewSet,
    RoomSettingsViewSet, RoomSettingsRoomNameListViewSet,
)

app_name = 'api.vrmchat.v1'

urlpatterns = [
    # Room model
    path('room/',              RoomCreateViewSet.as_view(), name='room_create'),
    path('room/<str:room_id>', RoomDeleteViewSet.as_view(), name='room_delete'),
    # RoomSettings model
    path('room_settings/<str:room_id>',  RoomSettingsViewSet.as_view(),             name='room_settings'),
    path('room_settings/list/room_name', RoomSettingsRoomNameListViewSet.as_view(), name='room_settings_room_name_list'),
]