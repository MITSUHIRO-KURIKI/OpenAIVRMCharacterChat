# https://www.django-rest-framework.org/api-guide/status-codes/
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
from common.scripts.DjangoUtils import generate_uuid_hex


class AccountDeleteViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def delete(self, request, *args, **kwargs):
        # データは残してログイン不可とする
        # 削除後に再度その人が登録する場合に備えてメールをダミーに変更
        try:
            user           = request.user
            user.is_active = False
            user.email     = generate_uuid_hex()+'@'+generate_uuid_hex()+'.com'
            user.save()
            response = Response({
                'message': 'success',
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response