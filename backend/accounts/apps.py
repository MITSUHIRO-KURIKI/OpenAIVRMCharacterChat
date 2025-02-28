from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    
    name         = 'accounts'
    verbose_name = _('01_アカウント')

    # axes_signals.py
    # https://django-axes.readthedocs.io/en/latest/6_integration.html#integration-with-django-rest-framework
    def ready(self):
        from accounts.axes_signals import raise_permission_denied