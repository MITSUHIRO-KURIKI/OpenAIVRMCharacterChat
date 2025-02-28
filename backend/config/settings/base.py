import os
import sys
import whitenoise
from pathlib import Path
from config.settings.read_env import read_env

###############
# 全体設定▽
## DEBUG
DEBUG = True
### テスト用の上書き実行
if 'test' in sys.argv:
    from config.settings.test import update_debug_settings
    DEBUG = update_debug_settings()
### 'production' force
if os.environ.get('DJANGO_ENV', 'development') == 'production':
    DEBUG = False

## EMAIL
IS_USE_EMAIL_SERVICE = False

# 全体設定△
###############


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# LOAD SECRET STEEINGS
env = read_env(BASE_DIR)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.get_value('DJANGO_SECRET_KEY',str)

# [LOAD security] Encryption.py
try:
    from .security.Encryption import *
except ImportError as e:
    print('ImportError occurred: ', e)

# ENDPOINT
ENDPOINT_PROTOCOL = env.get_value('ENDPOINT_PROTOCOL',str)
FRONTEND_DOMAIN   = env.get_value('FRONTEND_DOMAIN',str)
BACKEND_DOMAIN    = env.get_value('BACKEND_DOMAIN',str)
FRONTEND_URL      = ENDPOINT_PROTOCOL + '://' + FRONTEND_DOMAIN
BACKEND_URL       = ENDPOINT_PROTOCOL + '://' + BACKEND_DOMAIN

# ALLOWED_HOSTS
ALLOWED_HOSTS        = env.get_value('ALLOWED_HOSTS',str).split(',') # , 区切りで複数指定可能. スペース開けないこと
# CSRF
CSRF_TRUSTED_ORIGINS = [FRONTEND_URL, BACKEND_URL]
CSRF_COOKIE_NAME     = env.get_value('DJANGO_CSRF_COOKIE_NAME',str)
CSRF_HEADER_NAME     = env.get_value('DJANGO_CSRF_HEADER_NAME',str)
# CORS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS   = [FRONTEND_URL, BACKEND_URL]
# APPEND_SLASH
APPEND_SLASH=True

# Application definition
INSTALLED_APPS = [
    # CREATE APPS
    ## Base APPS
    'accounts.apps.AccountsConfig',
    'apps.access_security.apps.AccessSecurityConfig',
    'apps.user_properties.apps.UserPropertiesConfig',
    ## ADD APPS
    'apps.vrmchat.apps.VrmChatConfig',
    'apps.third_party.gcloud.stt_tts.apps.ThirdPartyGcloudSstTtsConfig',

    # DEFAULT
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'daphne',                                   # ADD daphne(django.contrib.staticfilesの前)
    'django.contrib.staticfiles',
    # 3rd Party APPS
    'common.lib.axes.apps.AxesConfig',          # ADD django-axes
    'corsheaders',                              # ADD django-cors-headers
    'channels',                                 # ADD channels
    'rest_framework',                           # ADD djangorestframework
    # 'rest_framework.authtoken',               # ADD djangorestframework.authtoken
    'rest_framework_simplejwt',                 # ADD rest_framework_simplejwt
    'rest_framework_simplejwt.token_blacklist', # ADD rest_framework_simplejwt.token_blacklist
    'djoser',                                   # ADD djoser
    'drf_standardized_errors',                  # ADD drf-standardized-errors
    'django_filters',                           # ADD django-filter
    'drf_spectacular',                          # ADD drf-spectacular
    'encrypted_fields',                         # ADD django-searchable-encrypted-fields
    'whitenoise.runserver_nostatic',            # ADD whitenoise
    'django_cleanup',                           # ADD django-cleanup(DELETE OLD IMAGE/ NOT DELETE MODEL DECORATE '@cleanup.ignore')
    'import_export',                            # ADD django-import-export
    'sorl.thumbnail',                           # ADD ImageFile Resize
]

# [LOAD .admin_protect] AdminProtectSetting.py
try:
    from .admin_protect.AdminProtectSetting import *
except ImportError as e:
    print('ImportError occurred: ', e)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',                                 # ADD WhiteNoiseMiddleware(https://qiita.com/ykoji/items/bd551b60488eb3131bef)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',                                      # ADD django-cors-headers
    'django.middleware.locale.LocaleMiddleware',                                  # ADD LocaleMiddleware(session middlewareの後/Common.middlewareの前)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'config.settings.security.AccessSecurityMiddleware.AccessSecurityMiddleware', # ADD Custom AccessSecurityMiddleware
    'config.settings.admin_protect.AdminProtect.AdminProtect',                    # ADD AdminProtect **MUST BEFORE AXES**
    'common.lib.axes.middleware.AxesMiddleware',                                  # ADD django-axes  **MUST BOTTOM**
]

# AUTHENTICATION_BACKENDS
AUTHENTICATION_BACKENDS = (
    'common.lib.axes.backends.AxesBackend',      # ADD django-axes **MUST TOP**
    'django.contrib.auth.backends.ModelBackend', # backends **MUST BUTTOM**
)

# ROOT_URLCONF
ROOT_URLCONF = 'config.urls'

# TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'libraries': {
                # Custom Template Simple Tag

                # Custom Template Filter

            },
        },
    },
]

# wsgi/asgi
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# [LOAD extra_settings] Database.py
try:
    from .extra_settings.Database import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD extra_settings] ChannelLayers.py
try:
    from .extra_settings.ChannelLayers import *
except ImportError as e:
    print('ImportError occurred: ', e)

# [LOAD security] PasswordHashers.py
try:
    from .security.PasswordHashers import *
except ImportError as e:
    print('ImportError occurred: ', e)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
      'OPTIONS': {'min_length': 12,}, },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
    # Custom Password Validation
    { 'NAME': 'config.settings.extra_settings.PasswordValidation.CustomValidator02', },
]

# AUTH USER MODELS
AUTH_USER_MODEL = 'accounts.CustomUser'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# [LOAD api_settings] Jwt.py
try:
    from .api_settings.Jwt import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD api_settings] NextAuth.py
try:
    from .api_settings.NextAuth import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD api_settings] Rest.py
try:
    from .api_settings.Rest import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD api_settings] TokenAge.py
try:
    from .api_settings.TokenAge import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD security] DeployBase.py
try:
    from .security.DeployBase import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD extra_settings] Axes.py
try:
    from .extra_settings.Axes import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD extra_settings] EmailBackend.py
try:
    from .extra_settings.EmailBackend import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD extra_settings] Language.py
try:
    from .extra_settings.Language import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD extra_settings] StaticMediaFiles.py
try:
    from .extra_settings.StaticMediaFiles import *
except ImportError as e:
    print('ImportError occurred: ', e)
# [LOAD 3rd_party_settings] Llms.py
try:
    from .third_party_settings.Llms import *
except ImportError as e:
    print('ImportError occurred: ', e)