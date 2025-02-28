from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# Database
## sqlite3
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME':   settings.BASE_DIR / 'db.sqlite3',
#     }
# }
## postgres
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql_psycopg2',
        'NAME':     env.get_value('POSTGRES_NAME',str),
        'USER':     env.get_value('POSTGRES_USER',str),
        'PASSWORD': env.get_value('POSTGRES_PASSWORD',str),
        'HOST':     env.get_value('POSTGRES_HOST',str),
        'PORT':     env.get_value('POSTGRES_PORT',int),
    }
}