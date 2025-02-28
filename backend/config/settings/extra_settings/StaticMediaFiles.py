import os
from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(settings.BASE_DIR, 'static')]
# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT       = os.path.join(settings.BASE_DIR, 'media')


STATIC_ROOT = os.path.join(settings.BASE_DIR, 'staticfiles')


# whitenoise
## https://devcenter.heroku.com/ja/articles/django-assets
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',  # ローカルファイルストレージを使用
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
## https://github.com/heroku/python-getting-started/blob/main/gettingstarted/settings.py
WHITENOISE_KEEP_ONLY_HASHED_FILES = True

# THUMBNAIL
# https://sorl-thumbnail.readthedocs.io/en/latest/reference/settings.html
# https://github.com/jazzband/sorl-thumbnail/tree/master
THUMBNAIL_PRESERVE_FORMAT = True # True: Preservation of format
THUMBNAIL_FORCE_OVERWRITE = True