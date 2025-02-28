# https://github.com/sunscrapers/djoser/blob/master/djoser/serializers.py
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from djoser.conf import settings
from djoser.serializers import (
    UserSerializer, UserCreateSerializer, UserCreatePasswordRetypeSerializer,
)
from common.lib.axes.utils import reset

User = get_user_model()


class CustomUserSerializer(UserSerializer):

    class Meta:
        model  = User
        fields = ('unique_account_id', 'email',)

# UserCreate ▽
# is_valid: ModelSerializer(BaseSerializer)を継承
# https://github.com/encode/django-rest-framework/blob/master/rest_framework/serializers.py#L87
## USER_CREATE_PASSWORD_RETYPE = True の場合には使われない
class CustomUserCreateSerializer(UserCreateSerializer):

    # 仮登録のアドレス(is_active=False)が新規登録された際には、
    # 前のデータを消してから後続処理を行う
    def is_valid(self, *, raise_exception=False):
        try:
            user = User.objects.filter(email=self.initial_data.get('email'),
                                   is_active=False,)
            if (user):
                user.delete()
        except:
            pass
        return super().is_valid(raise_exception=raise_exception)

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError('有効なメールアドレスを入力してください。')
        return value

    class Meta:
        model  = User
        fields = ('email', 'password',)

class CustomUserCreatePasswordRetypeSerializer(UserCreatePasswordRetypeSerializer):

    # 仮登録のアドレス(is_active=False)が新規登録された際には、
    # 前のデータを消してから後続処理を行う
    def is_valid(self, *, raise_exception=False):
        try:
            user = User.objects.filter(email=self.initial_data.get('email'),
                                   is_active=False,)
            if (user):
                user.delete()
        except:
            pass
        return super().is_valid(raise_exception=raise_exception)

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError('有効なメールアドレスを入力してください。')
        return value

    class Meta:
        model  = User
        fields = ('email', 'password',)
# UserCreate △

# SetPassword ▽
## 現在と同じパスワードの設定不可 / 現在のパスワードを間違えた場合に django-axes をトリガー
class CustomPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        user = getattr(self, 'user', None) or self.context['request'].user
        # why assert? There are ValidationError / fail everywhere
        assert user is not None

        if attrs['new_password'] == attrs['current_password']:
            raise serializers.ValidationError({'new_password': '現在と同じパスワードは再設定できません'})

        try:
            validate_password(attrs['new_password'], user)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})

        return super().validate(attrs)

class CustomPasswordRetypeSerializer(CustomPasswordSerializer):
    re_new_password = serializers.CharField(style={'input_type': 'password'})

    default_error_messages = {
        'password_mismatch': settings.CONSTANTS.messages.PASSWORD_MISMATCH_ERROR
    }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if attrs['new_password'] == attrs['re_new_password']:
            return attrs
        else:
            self.fail('password_mismatch')

class CustomCurrentPasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(style={'input_type': 'password'})

    default_error_messages = {
        'invalid_password': settings.CONSTANTS.messages.INVALID_PASSWORD_ERROR
    }

    def validate_current_password(self, value):
        is_password_valid = self.context['request'].user.check_password(value)
        if is_password_valid:
            # django-axes リセット
            ## 再設定のパスワードバリデーション不可でも
            ## 現在のパスワードがあっていればリセットをかける
            reset(username=self.context['request'].user.email)
            return value
        else:
            # authenticate から django-axes をトリガー
            # email/password が間違っていたら失敗回数を保存
            authenticate(request=self.context['request'], username=self.context['request'].user.email, password=value)
            self.fail('invalid_password')

## SET_PASSWORD_RETYPE = True の場合には使われない
class CustomSetPasswordSerializer(CustomPasswordSerializer, CustomCurrentPasswordSerializer):
    pass
    
class CustomSetPasswordRetypeSerializer(CustomPasswordRetypeSerializer, CustomCurrentPasswordSerializer):
    pass
# SetPassword △