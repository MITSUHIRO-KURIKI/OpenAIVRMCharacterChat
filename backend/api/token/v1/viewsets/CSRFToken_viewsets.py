from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

class CSRFTokenViewSet(APIView):

    # 匿名アクセス許可
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # CSRFトークンを取得
            csrf_token = get_token(request)

            # Response オブジェクトを作成
            response = Response({
                'message': 'Get CSRF-Token successful',
            }, status=status.HTTP_200_OK)

            # Cookie に CSRFトークン を設定
            response.set_cookie(
                key      = settings.CSRF_COOKIE_NAME,
                value    = csrf_token,
                httponly = True,
                secure   = False if settings.DEBUG else True,
                samesite = 'Lax',
            )
        except Exception as e:
            response = Response({
                'message': 'Get CSRF-Token failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return response