# AwsomeRef: https://github.com/nextauthjs/next-auth/discussions/8807#discussioncomment-8180597
from django.conf import settings
import json
from typing import Optional, Dict, Any
from hkdf import Hkdf
from jose.jwe import decrypt, encrypt

def __encryption_key(secret: str = settings.NEXTAUTH_SECRET
                    ) -> bytes:
    return Hkdf("", bytes(secret, 'utf-8')).expand(b'NextAuth.js Generated Encryption Key', 32)

def encode_jwe(payload: Dict[str, Any],
               secret:  str = settings.NEXTAUTH_SECRET,
              ) -> Optional[str]:
    try:
        if payload:
            data = bytes(json.dumps(payload), 'utf-8')
            key  = __encryption_key(secret)
            return bytes.decode(encrypt(data, key), 'utf-8')
        else:
            return None
    except: return None

def decode_jwe(token:  str,
               secret: str = settings.NEXTAUTH_SECRET,
              ) -> Optional[Dict[str, Any]]:
    try:
        decrypted = decrypt(token, __encryption_key(secret))
        if decrypted:
            return json.loads(bytes.decode(decrypted, 'utf-8'))
        else:
            return None
    except: return None

def get_session_token(scope_cookies: Optional[Dict[str, str]] = None
                     ) -> Optional[str]:
    session_token = None
    if scope_cookies:
        for key, value in scope_cookies.items():
            if 'next-auth.session-token' in key:
                session_token = value
                break
    return session_token