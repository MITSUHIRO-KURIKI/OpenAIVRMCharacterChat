from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# common.auth.NextAuthDecription.py で使用
# next-auth.session-token を復号する
NEXTAUTH_SECRET = env.get_value('NEXTAUTH_SECRET',str)