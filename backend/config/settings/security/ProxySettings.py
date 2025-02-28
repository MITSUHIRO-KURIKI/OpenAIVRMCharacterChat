from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# if use 'http_client' of some library from httpx import Client(proxies=*)
HTTP_PROXY  = 'http://'+env.get_value('PROXY_PRIBATE_IP',str)+':'+env.get_value('PROXY_PORT',str)
HTTPS_PROXY = 'https://'+env.get_value('PROXY_PRIBATE_IP',str)+':'+env.get_value('PROXY_PORT',str)