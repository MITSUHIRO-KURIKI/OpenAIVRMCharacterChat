from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)


# 管理画面URL
ADMIN_PATH = env.get_value('ADMIN_PATH',str) 
# 管理画面 アクセス許可IPアドレス(, 区切りで複数指定可能. スペース開けないこと)
ALLOWED_IP_ADMIN = env.get_value('ALLOWED_IP_ADMIN',str).split(',')