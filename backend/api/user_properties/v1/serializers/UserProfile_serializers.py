from rest_framework.serializers import ModelSerializer, CharField
from apps.user_properties.models import UserProfile

class UserProfileSerializer(ModelSerializer):

    # unique_account_id = CharField(source='unique_account_id.unique_account_id', read_only=True)

    class Meta:
        model  = UserProfile
        fields = ['display_name', 'user_icon']
        read_only_fields = ('id','unique_account_id',)