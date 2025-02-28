# https://www.django-rest-framework.org/api-guide/status-codes/
# https://zenn.dev/microsoft/articles/azure_next_english_lesson
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
import requests

class getTokenOrRefreshViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.subscription_key = settings.AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY
        self.speech_region    = settings.AZURE_SPEECH_SERVICES_REGION

    def _get_speech_token(self):
        """
        Azure Speech Services 用のアクセストークンを取得する関数
        """
        try:
            url     = f'https://{self.speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken'
            headers = {
                'Ocp-Apim-Subscription-Key': self.subscription_key,
                'Content-Type':              'application/x-www-form-urlencoded',
            }
            response = requests.post(url, data=None, headers=headers)
            response.raise_for_status()
            access_token = response.text
            return access_token
        except requests.exceptions.RequestException as e:
            return None

    def post(self, request, *args, **kwargs):
        set_cookie_prefix = request.data.get('set_cookie_prefix')
        speech_token      = request.COOKIES.get(f'{set_cookie_prefix}speech-token')
        if speech_token:
            # すでに Cookie がある場合は、その値をそのまま返す
            parts = speech_token.split(':')
            if len(parts) == 2:
                access_token, region = parts
            else:
                access_token = parts[0]
                region       = self.speech_region
            response = Response({
                'access_token': access_token,
                'region':       region,
            }, status=status.HTTP_200_OK)
            return response

        try:
            access_token = self._get_speech_token()

            if access_token:
                response = Response({
                    'access_token': access_token,
                    'region':       self.speech_region,
                }, status=status.HTTP_200_OK)
            else:
                response = Response({
                    'message': 'Get Token failed',
                }, status=status.HTTP_400_BAD_REQUEST)

            # Cookie に CSRFトークン を設定
            response.set_cookie(
                key      = f'{set_cookie_prefix}speech-token',
                value    = access_token+':'+self.speech_region,
                max_age  = 540,
                httponly = False,
                secure   = False if settings.DEBUG else True,
                samesite = 'Lax',
            )
        except Exception as e:
            response = Response({
                'message': 'Get Token failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return response