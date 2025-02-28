from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class AccessSecurityConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    
    name         = 'apps.access_security'
    verbose_name = _('99_アクセスブロック')