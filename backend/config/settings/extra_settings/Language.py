import os
from django.conf import settings
from django.utils.translation import gettext_lazy as _

LANGUAGES = [
    ('ja', _('Japanese')),
    ('en', _('English')),
]
LOCALE_PATHS = [os.path.join(settings.BASE_DIR, 'locale')]

# Internationalization
LANGUAGE_CODE = 'ja'  # 言語設定
TIME_ZONE     = 'UTC' # タイムゾーン設定
USE_I18N      = True
USE_L10N      = False
USE_TZ        = True