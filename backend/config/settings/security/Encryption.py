# References
# https://pypi.org/project/django-searchable-encrypted-fields/
from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)


FIELD_ENCRYPTION_KEYS = [
    env.get_value('FIELD_ENCRYPTION_KEYS_01',str),
]
ENCRYPTION_HASH_KEY = env.get_value('ENCRYPTION_HASH_KEY',str)