from django.conf import settings
from .free_domain import FREE_DOMAIN_LISTS, MOBILE_DOMAIN_LISTS

ACCEPT_DOMAIN_LISTS = FREE_DOMAIN_LISTS + MOBILE_DOMAIN_LISTS

# 登録できるメールアドレスを特定ドメインだけ許可する場合
def custom_email_validater(email:str) -> bool:
    return True
    # email_domain = email.split('@')[-1] if email else ''
    # if email_domain in ACCEPT_DOMAIN_LISTS:
    #     return True
    # else:
    #     return False