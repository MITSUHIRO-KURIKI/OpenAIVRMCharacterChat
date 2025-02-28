from rest_framework.serializers import ModelSerializer, CharField
from apps.user_properties.models import UserReceptionSetting

class UserReceptionSettingSerializer(ModelSerializer):

    # unique_account_id = CharField(source='unique_account_id.unique_account_id', read_only=True)

    class Meta:
        model  = UserReceptionSetting
        fields = ['is_receive_all', 'is_receive_important_only']
        read_only_fields = ('id','unique_account_id',)