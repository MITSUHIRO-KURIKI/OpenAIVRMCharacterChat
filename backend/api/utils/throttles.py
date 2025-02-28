from rest_framework.throttling import UserRateThrottle

# settings.api.Rest
# -> 'frequent':   '100/second',
# -> 'standard':   '50/second',
# -> 'limited':    '5/second', 
# -> 'restricted': '20/hour',
# -> 'critical':   '5/day',

# 1. Frequent
class FrequentThrottle(UserRateThrottle):
    scope = 'frequent'

# 2. Standard
# TokenVerify
class StandardThrottle(UserRateThrottle):
    scope = 'standard'

# 3. Limited
# ログイン/ログアウト処理
class LimitedThrottle(UserRateThrottle):
    scope = 'limited'

# 4. Restricted
# メール送信系
class RestrictedThrottle(UserRateThrottle):
    scope = 'restricted'

# 5. Critical
class CriticalThrottle(UserRateThrottle):
    scope = 'critical'