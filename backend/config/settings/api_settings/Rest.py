from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)


# REST_FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication', # 認証に Header を仕様する場合
        # 'common.auth.CookieJWTAuthentication',                     # 認証に Cookie を仕様する場合
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
        'djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer',
    ),
    # https://www.django-rest-framework.org/api-guide/throttling/#setting-the-throttling-policy
    # - AnonRateThrottle は IP 単位
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'frequent':   '100/second',
        'standard':   '50/second',
        'limited':    '5/second', 
        'restricted': '20/hour',
        'critical':   '5/day',
        'anon': f"{env.get_value('REST_ANON_THROTTLE_RATES_PER_MIN',int)}/minute",
        'user': f"{env.get_value('REST_USER_THROTTLE_RATES_PER_MIN',int)}/minute",
    },
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
        'djangorestframework_camel_case.parser.CamelCaseFormParser',
        'djangorestframework_camel_case.parser.CamelCaseMultiPartParser',
    ),
    'DEFAULT_FILTER_BACKENDS':  ('django_filters.rest_framework.DjangoFilterBackend',),
    'DEFAULT_PAGINATION_CLASS': 'common.scripts.DjangoUtils.CustomPageNumberPagination',
    # https://drf-standardized-errors.readthedocs.io/en/latest/quickstart.html#quickstart
    'EXCEPTION_HANDLER': 'drf_standardized_errors.handler.exception_handler',
}

if settings.DEBUG:
    REST_FRAMEWORK.update({
        'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    })
    # ADD drf-standardized-errors
    DRF_STANDARDIZED_ERRORS = {'ENABLE_IN_DEBUG_FOR_UNHANDLED_EXCEPTIONS': True}
    # ADD drf-spectacular
    _ENDPOINT_PROTOCOL = env.get_value('ENDPOINT_PROTOCOL',str)
    _BACKEND_DOMAIN    = env.get_value('BACKEND_DOMAIN',str)
    _BACKEND_URL       = _ENDPOINT_PROTOCOL + '://' + _BACKEND_DOMAIN
    SPECTACULAR_SETTINGS = {
        'TITLE':       env.get_value('SITE_NAME',str) + ' | API',
        'DESCRIPTION': env.get_value('SITE_NAME',str) + ' | API',
        'TOS':         None,
        'CONTACT':     {},
        'LICENSE':     {},
        'VERSION':     '0.0.0',
        'SERVERS': [{
            'url':         _BACKEND_URL,
            'description': 'dev',
        }],
        'CAMELIZE_NAMES':        True,
        'COMPONENT_SPLIT_PATCH': False,
        # https://drf-standardized-errors.readthedocs.io/en/latest/openapi.html#configuration
        'ENUM_NAME_OVERRIDES': {
            'ValidationErrorEnum': 'drf_standardized_errors.openapi_serializers.ValidationErrorEnum.choices',
            'ClientErrorEnum':     'drf_standardized_errors.openapi_serializers.ClientErrorEnum.choices',
            'ServerErrorEnum':     'drf_standardized_errors.openapi_serializers.ServerErrorEnum.choices',
            'ErrorCode401Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode401Enum.choices',
            'ErrorCode403Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode403Enum.choices',
            'ErrorCode404Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode404Enum.choices',
            'ErrorCode405Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode405Enum.choices',
            'ErrorCode406Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode406Enum.choices',
            'ErrorCode415Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode415Enum.choices',
            'ErrorCode429Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode429Enum.choices',
            'ErrorCode500Enum':    'drf_standardized_errors.openapi_serializers.ErrorCode500Enum.choices',
        },
        'POSTPROCESSING_HOOKS': ['drf_standardized_errors.openapi_hooks.postprocess_schema_enums'],
    }