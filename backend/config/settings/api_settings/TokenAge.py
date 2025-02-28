from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)


# from django.contrib.auth.tokens import default_token_generator に基づくトークンの有効期限(秒)
# 最終ログイン日時更新、パスワード変更、タイムアウトで無効になる
PASSWORD_RESET_TIMEOUT = env.get_value('PASSWORD_RESET_TIMEOUT_SEC',int)