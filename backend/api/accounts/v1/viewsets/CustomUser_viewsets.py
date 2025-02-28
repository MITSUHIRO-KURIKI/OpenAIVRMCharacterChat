# https://github.com/sunscrapers/djoser/blob/master/djoser/views.py
# https://github.com/encode/django-rest-framework/blob/master/rest_framework/viewsets.py
from django.conf import settings as django_settings
from django.contrib.auth import update_session_auth_hash
from django.utils.timezone import now
from djoser import signals, utils
from djoser.compat import get_user_email
from djoser.conf import settings
from djoser.views import UserViewSet
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from common.lib.axes.utils import reset
from api.utils import LimitedThrottle, RestrictedThrottle


class CustomUserViewSet(UserViewSet):

    lookup_field     = 'unique_account_id'
    lookup_url_kwarg = 'unique_account_id'

    # PUT と PATCH は不要なため除外
    http_method_names = ['get', 'post', 'head', 'options',]

    # /api/accounts/ 置き換え
    ## スロット分類は [Restricted]
    def get_throttles(self):
        if self.action == 'create':
            self.throttle_classes = [RestrictedThrottle]

        return super().get_throttles()

    # activation 置き換え
    ## パスワード変更日時の記録
    ## スロット分類は [Limited]
    @action(['post'], detail=False, throttle_classes=[LimitedThrottle])
    def activation(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user                      = serializer.user
        user.is_active            = True
        user.date_password_change = now() # パスワード変更日時の記録
        user.save()

        signals.user_activated.send(
            sender=self.__class__, user=user, request=self.request
        )

        if settings.SEND_CONFIRMATION_EMAIL:
            context = {'user': user}
            to      = [get_user_email(user)]
            settings.EMAIL.confirmation(self.request, context).send(to)

        return Response(status=status.HTTP_204_NO_CONTENT)

    ## スロット分類は [Limited]
    @action(['get'], detail=False, throttle_classes=[LimitedThrottle])
    def me(self, request, *args, **kwargs):
        return super().me(request, *args, **kwargs)

    # set_password 置き換え
    ## パスワード変更日時の記録 / AXES リセット 処理を追加
    ## スロット分類は [Limited]
    @action(['post'], detail=False, throttle_classes=[LimitedThrottle])
    def set_password(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.request.user.set_password(serializer.data['new_password'])
        self.request.user.date_password_change = now() # パスワード変更日時の記録
        self.request.user.save()

        if django_settings.AXES_RESET_ON_SUCCESS:
            reset(username=self.request.user.email)    # django-axes リセット

        if settings.PASSWORD_CHANGED_EMAIL_CONFIRMATION:
            context = {'user': self.request.user}
            to      = [get_user_email(self.request.user)]
            settings.EMAIL.password_changed_confirmation(self.request, context).send(to)

        if settings.LOGOUT_ON_PASSWORD_CHANGE:
            utils.logout_user(self.request)
        elif settings.CREATE_SESSION_ON_LOGIN:
            update_session_auth_hash(self.request, self.request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    ## スロット分類は [Restricted]
    @action(['post'], detail=False, throttle_classes=[RestrictedThrottle])
    def reset_password(self, request, *args, **kwargs):
        return super().reset_password(request, *args, **kwargs)

    # reset_password_confirm 置き換え
    ## ログイン日時の記録の削除 / パスワード変更日時の記録 / AXES リセット 処理を追加
    ## スロット分類は [Restricted]
    @action(['post'], detail=False, throttle_classes=[RestrictedThrottle])
    def reset_password_confirm(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.user.set_password(serializer.data['new_password'])

        if hasattr(serializer.user, 'date_password_change'):
            serializer.user.date_password_change = now() # パスワード変更日時の記録
        serializer.user.save()

        if django_settings.AXES_RESET_ON_SUCCESS:
            reset(username=serializer.user.email)        # django-axes リセット

        if settings.PASSWORD_CHANGED_EMAIL_CONFIRMATION:
            context = {'user': serializer.user}
            to = [get_user_email(serializer.user)]
            settings.EMAIL.password_changed_confirmation(self.request, context).send(to)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def resend_activation(self, request, *args, **kwargs):
        # アクションを無効化
        ## 未登録のユーザを削除して再登録を実装
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def reset_username(self, request, *args, **kwargs):
        # アクションを無効化
        ## 現在のアドレスへ認証URLを送って新しいメールアドレスを入力して
        ## 即時反映のため、新しいメールアドレスの認証ができないため
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def reset_username_confirm(self, request, *args, **kwargs):
        # アクションを無効化
        ## 現在のアドレスへ認証URLを送って新しいメールアドレスを入力して
        ## 即時反映のため、新しいメールアドレスの認証ができないため
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def set_username(self, request, *args, **kwargs):
        # アクションを無効化
        ## 新しいメールアドレスの認証ができないため
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)