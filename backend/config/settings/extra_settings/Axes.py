from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)


# MEASURE BRUTE FORCE ATTACK
AXES_FAILURE_LIMIT      = env.get_value('AXES_FAILURE_LIMIT',int)       # ログイン試行回数
AXES_COOLOFF_TIME       = env.get_value('AXES_COOLOFF_TIME',float)      # アカウントロック時間(/HOURS)
AXES_ONLY_USER_FAILURES = env.get_value('AXES_ONLY_USER_FAILURES',bool) # ロック対象をユーザ(DEFORT IP ADDRESS)
AXES_RESET_ON_SUCCESS   = env.get_value('AXES_RESET_ON_SUCCESS',bool)   # ログイン成功で回数をリセット