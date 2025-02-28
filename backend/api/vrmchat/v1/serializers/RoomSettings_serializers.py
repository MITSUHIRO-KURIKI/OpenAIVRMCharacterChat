from rest_framework.serializers import ModelSerializer, CharField
from apps.vrmchat.models import RoomSettings

class RoomSettingsSerializer(ModelSerializer):

    room_id = CharField(source='room_id.room_id', read_only=True)

    class Meta:
        model  = RoomSettings
        fields = '__all__'
        read_only_fields = ('id','room_id',)