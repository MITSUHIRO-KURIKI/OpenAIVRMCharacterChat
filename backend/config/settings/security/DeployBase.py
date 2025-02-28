# https://qiita.com/juchilian/items/3afa2d679fb88bd70aff
import os

if os.environ.get('DJANGO_ENV', 'development') == 'production':
    # SECURE_HSTS_SECONDS            = 31536000 # 無知にいじると危険なのでコメントアウト
    # SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    # SECURE_HSTS_PRELOAD            = True
    SECURE_CONTENT_TYPE_NOSNIFF    = True
    SECURE_BROWSER_XSS_FILTER      = True
    SECURE_SSL_REDIRECT            = True
    SECURE_PROXY_SSL_HEADER        = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE          = True
    CSRF_COOKIE_SECURE             = True
    X_FRAME_OPTIONS                = 'DENY'