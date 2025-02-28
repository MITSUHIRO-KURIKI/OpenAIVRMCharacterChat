import sys
from django.conf import settings
from datetime import timedelta

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

IS_RESPONSE_JWT_COOKIE = False

# Simple JWT
# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/settings.html
SIMPLE_JWT ={
    # LIFETIME
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=env.get_value('SIMPLE_JWT_ACCESS_TOKEN_LIFETIME_MIN',int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env.get_value('SIMPLE_JWT_REFRESH_TOKEN_LIFETIME_DAYS',int)),
    'LEEWAY':                 env.get_value('SIMPLE_JWT_LEEWAY',int),
    # ROTATION
    ## ROTATE_REFRESH_TOKENS:
    ##  - リフレッシュ時に LIFETIME が更新されるので継続利用中は常にログイン状態になる
    ##  - 一定時間で常にログインを要求する場合には False 設定
    'ROTATE_REFRESH_TOKENS':    env.get_value('SIMPLE_JWT_ROTATE_REFRESH_TOKENS',bool),
    'BLACKLIST_AFTER_ROTATION': env.get_value('SIMPLE_JWT_BLACKLIST_AFTER_ROTATION',bool),
    'UPDATE_LAST_LOGIN':        False, # common.serializers.Simplejwt_Custom_Serializers でカスタム処理
    # 暗号化
    'ALGORITHM':   env.get_value('SIMPLE_JWT_ALGORITHM',str),
    'SIGNING_KEY': env.get_value('SIMPLE_JWT_SECRET_KEY',str),
    # AUTH_HEADER
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME':  'HTTP_AUTHORIZATION',
    # USER_ID
    'USER_ID_FIELD':            'id',
    'USER_ID_CLAIM':            'custom_user_model_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    # AUTH_TOKEN
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM':   'token_type',
    'TOKEN_USER_CLASS':   'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM':          'jti',
    # SERIALIZER
    'TOKEN_OBTAIN_SERIALIZER':    'api.token.v1.serializers.CustomTokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER':   'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
    'TOKEN_VERIFY_SERIALIZER':    'rest_framework_simplejwt.serializers.TokenVerifySerializer',
    'TOKEN_BLACKLIST_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenBlacklistSerializer',
}
# テスト用の上書き実行
if 'test' in sys.argv:
    from config.settings.test import update_jwt_settings
    SIMPLE_JWT = update_jwt_settings(SIMPLE_JWT)

# Djoser
# Ref: https://zenn.dev/hathle/books/drf-auth-book/viewer/04_settings
_EMAIL_FRONTEND_DOMAIN   = env.get_value('FRONTEND_DOMAIN',str)
_EMAIL_FRONTEND_PROTOCOL = env.get_value('ENDPOINT_PROTOCOL',str)
DJOSER = {
    # メールアドレスでログイン
    'USER_ID_FIELD': 'pk',
    'LOGIN_FIELD':   'email',
    # cert_email 
    'SEND_ACTIVATION_EMAIL':               env.get_value('DJOSER_SEND_ACTIVATION_EMAIL',bool),               # アカウント本登録メール
    'SEND_CONFIRMATION_EMAIL':             env.get_value('DJOSER_SEND_CONFIRMATION_EMAIL',bool),             # アカウント本登録完了メール
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': False,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': env.get_value('DJOSER_PASSWORD_CHANGED_EMAIL_CONFIRMATION',bool), # パスワード変更完了メール
    # FRONTEND URL(メール認証時にメール本文に記載)
    'ACTIVATION_URL':             'activate/{uid}/{token}',       # アカウント本登録URL      (djoser.views.UserViewSet > activation/ に POST)
    'PASSWORD_RESET_CONFIRM_URL': 'password_reset/{uid}/{token}', # パスワード再設定完了URL   (djoser.views.UserViewSet > reset_password_confirm/ に POST)
    # EMAIL
    ## https://djoser.readthedocs.io/en/latest/settings.html#email
    'EMAIL_FRONTEND_DOMAIN':    _EMAIL_FRONTEND_DOMAIN,
    'EMAIL_FRONTEND_PROTOCOL':  _EMAIL_FRONTEND_PROTOCOL,
    'EMAIL_FRONTEND_SITE_NAME': env.get_value('SITE_NAME',str),
    'EMAIL': {
        'activation':                    'api.accounts.v1.cert_email.ActivationEmail',                  # アカウント本登録
        'confirmation':                  'api.accounts.v1.cert_email.ConfirmationEmail',                # アカウント本登録完了
        'password_reset':                'api.accounts.v1.cert_email.PasswordResetEmail',               # パスワード再設定
        'password_changed_confirmation': 'api.accounts.v1.cert_email.PasswordChangedConfirmationEmail', # パスワード再設定完了
        'username_reset':                'api.accounts.v1.cert_email.EmailResetEmail',                  # メールアドレス変更
        'username_changed_confirmation': 'api.accounts.v1.cert_email.EmailChangedConfirmationEmail',    # メールアドレス変更完了
    },
    # 再入力必須 (ReType)
    'USER_CREATE_PASSWORD_RETYPE':   env.get_value('DJOSER_USER_CREATE_PASSWORD_RETYPE',bool),   # アカウント登録時のパスワード
    'SET_PASSWORD_RETYPE':           env.get_value('DJOSER_SET_PASSWORD_RETYPE',bool),           # パスワード変更時のパスワード
    'PASSWORD_RESET_CONFIRM_RETYPE': env.get_value('DJOSER_PASSWORD_RESET_CONFIRM_RETYPE',bool), # パスワード再設定時のパスワード
    # カスタムユーザー用シリアライザー
    ## https://djoser.readthedocs.io/en/latest/settings.html#serializers
    'SERIALIZERS': {
        'activation':                    'djoser.serializers.ActivationSerializer',
        'password_reset':                'djoser.serializers.SendEmailResetSerializer',
        'password_reset_confirm':        'djoser.serializers.PasswordResetConfirmSerializer',
        'password_reset_confirm_retype': 'djoser.serializers.PasswordResetConfirmRetypeSerializer',
        'set_password':                  'api.accounts.v1.serializers.CustomSetPasswordSerializer',
        'set_password_retype':           'api.accounts.v1.serializers.CustomSetPasswordRetypeSerializer',
        'user_create':                   'api.accounts.v1.serializers.CustomUserCreateSerializer',
        'user_create_password_retype':   'api.accounts.v1.serializers.CustomUserCreatePasswordRetypeSerializer',
        'user_delete':                   'djoser.serializers.UserDeleteSerializer',
        'user':                          'api.accounts.v1.serializers.CustomUserSerializer',
        'current_user':                  'api.accounts.v1.serializers.CustomUserSerializer',
        'token':                         'djoser.serializers.TokenSerializer',
        'token_create':                  'djoser.serializers.TokenCreateSerializer',
    },
    # SOCIAL_AUTH
    'SOCIAL_AUTH_TOKEN_STRATEGY': 'djoser.social.token.jwt.TokenStrategy',
    'SOCIAL_AUTH_ALLOWED_REDIRECT_URIS': [
        _EMAIL_FRONTEND_PROTOCOL + '://' + _EMAIL_FRONTEND_DOMAIN,
    ],
    # NOT FOUND返却 (第三者が登録済みを確認できるため False 推奨)
    'PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND': env.get_value('DJOSER_PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND',bool),
    'USERNAME_RESET_SHOW_EMAIL_NOT_FOUND': env.get_value('DJOSER_USERNAME_RESET_SHOW_EMAIL_NOT_FOUND',bool),
    # その他
    'LOGOUT_ON_PASSWORD_CHANGE': env.get_value('DJOSER_LOGOUT_ON_PASSWORD_CHANGE',bool),
    'CREATE_SESSION_ON_LOGIN':   env.get_value('DJOSER_CREATE_SESSION_ON_LOGIN',bool),
}