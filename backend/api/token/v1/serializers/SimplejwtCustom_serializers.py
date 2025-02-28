from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from common.lib.axes.utils import reset

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            raise AuthenticationFailed(_('Invalid request'))

        # authenticate から django-axes をトリガー
        # email/password が間違っていたら失敗回数を保存
        user = authenticate(request=request, username=attrs['email'], password=attrs['password'])
        if user and user.is_active:
            # 認証成功
            user.before_last_login = user.last_login # before_last_login セット
            user.last_login        = timezone.now()  # last_login セット
            user.save()
            if settings.AXES_RESET_ON_SUCCESS:
                reset(username=user.email)           # django-axes リセット

        # トークン生成の続行
        return super().validate(attrs)