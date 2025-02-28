from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Authorizationヘッダーを読み取る代わりに、アクセストークンを HttpOnly クッキーから取得する
    """
    def get_header(self, request):
        # 通常はrequest.METAからヘッダーを取得するが、ここではCookieから取得したトークンを
        # "<AUTH_HEADER_TYPES> <token>" 形式で擬似的に返す
        access_token = request.COOKIES.get('access', None)
        if not access_token:
            return None

        # JWTAuthentication は bytes のヘッダーを想定するため、エンコード
        return (f'{settings.SIMPLE_JWT["AUTH_HEADER_TYPES"][0]} {access_token}').encode('ascii')