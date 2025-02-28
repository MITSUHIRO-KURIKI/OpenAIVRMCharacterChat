from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from common.auth import decode_jwe, get_session_token
from typing import Optional, Dict


def jwt_auth_get_id(scope_cookies: Optional[Dict[str, str]] = None,
                    ) -> Optional[int]:
    """
    クッキーからアクセストークンを取得し、ユーザーIDを返す。

    Args:
        scope_cookies (Optional[Dict[str, str]]): クッキー辞書。

    Returns:
        Optional[int]: ユーザーID（存在する場合）、または None。
    """
    user_id = None
    session_token = get_session_token(scope_cookies)
    if session_token:
        session = decode_jwe(session_token)
        if session:
            # NextAuth の session名をハードコードしてるので注意
            access_token = session.get('accessToken')
            if access_token:
                try:
                    validated_token = AccessToken(access_token)
                    user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
                except Exception as e:
                    pass
    return user_id