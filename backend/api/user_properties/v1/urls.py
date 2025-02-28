from django.urls import path
from .viewsets import UserProfileViewSet, UserReceptionSettingViewSet

app_name = 'api.user_properties.v1'

urlpatterns = [
    # UserProfile model
    path('user_profile/', UserProfileViewSet.as_view(), name='user_profile'),
    # UserReceptionSetting model
    path('reception_setting/', UserReceptionSettingViewSet.as_view(), name='reception_setting'),
]