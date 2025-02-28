# https://qiita.com/shitikakei/items/d818fb0aa8670aa4228c
# https://github.com/jazzband/djangorestframework-simplejwt/blob/master/rest_framework_simplejwt/views.py
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView,
    TokenBlacklistView, TokenVerifyView,
)
from api.utils import StandardThrottle, LimitedThrottle

# CSRF検証不要 (ログイン前のため)
# パーミッションは ALL
# スロット分類は [Limited]
class CustomTokenObtainPairViewSet(TokenObtainPairView):

    permission_classes = [AllowAny]
    throttle_classes   = [LimitedThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if settings.IS_RESPONSE_JWT_COOKIE:
            response.set_cookie(
                key      = 'access',
                value    = response.data['access'],
                httponly = True,
                secure   = False if settings.DEBUG else True,
                samesite = 'Lax',
                max_age  = int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            )
            response.set_cookie(
                key      = 'refresh',
                value    = response.data['refresh'],
                httponly = True,
                secure   = False if settings.DEBUG else True,
                samesite = 'Lax',
                max_age  = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            )
            # レスポンスボディからトークンを除外
            response.data = {
                'message': 'Login successful',
            }
        else:
            response.data['message'] = 'Login successful'
        return response

# CSRF検証不要 (JWTベースのため)
# パーミッションは ALL
# スロット分類は [Standard]
class CustomTokenRefreshViewSet(TokenRefreshView):

    permission_classes = [AllowAny]
    throttle_classes   = [StandardThrottle]

    def get_serializer(self, *args, **kwargs):
        if settings.IS_RESPONSE_JWT_COOKIE:
            refresh_token = self.request.COOKIES.get('refresh', None)
            if refresh_token:
                kwargs['data'] = {'refresh': refresh_token}
        return super().get_serializer(*args, **kwargs)

    def post(self, request, *args, **kwargs):

        response = super().post(request, *args, **kwargs)

        if settings.IS_RESPONSE_JWT_COOKIE:
            response.set_cookie(
                key      = 'access',
                value    = response.data['access'],
                httponly = True,
                secure   = False if settings.DEBUG else True,
                samesite = 'Lax',
                max_age  = int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            )
            if settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS']:
                response.set_cookie(
                    key      = 'refresh',
                    value    = response.data['refresh'],
                    httponly = True,
                    secure   = False if settings.DEBUG else True,
                    samesite = 'Lax',
                    max_age  = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                )
            # レスポンスボディからトークンを除外
            response.data = {
                'message': 'Refresh successful',
            }
        else:
            response.data['message'] = 'Refresh successful'
        return response

# CSRF検証不要 (JWTベースのため)
# パーミッションは ALL
# スロット分類は [Standard]
class CustomTokenVerifyViewSet(TokenVerifyView):

    permission_classes = [AllowAny]
    throttle_classes   = [StandardThrottle]

    def get_serializer(self, *args, **kwargs):
        if settings.IS_RESPONSE_JWT_COOKIE:
            access_token = self.request.COOKIES.get('token', None)
            if access_token:
                kwargs['data'] = { 'token': access_token }
        return super().get_serializer(*args, **kwargs)

# CSRF検証不要 (JWTベースのため)
# パーミッションは ALL
# スロット分類は [Limited]
class CustomTokenBlacklistViewSet(TokenBlacklistView):

    permission_classes = [AllowAny]
    throttle_classes   = [LimitedThrottle]

    def get_serializer(self, *args, **kwargs):
        if settings.IS_RESPONSE_JWT_COOKIE:
            refresh_token = self.request.COOKIES.get('refresh', None)
            if refresh_token:
                kwargs['data'] = {'refresh': refresh_token}
        return super().get_serializer(*args, **kwargs)

    def post(self, request, *args, **kwargs):

        response = super().post(request, *args, **kwargs)

        if settings.IS_RESPONSE_JWT_COOKIE:
            try:
                response.delete_cookie('access')
                response.delete_cookie('refresh')
            except Exception as e:
                pass
        return response