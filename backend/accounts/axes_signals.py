from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import PermissionDenied
from common.lib.axes.signals import user_locked_out

# https://django-axes.readthedocs.io/en/latest/6_integration.html#integration-with-django-rest-framework
@receiver(user_locked_out)
def raise_permission_denied(*args, **kwargs):
    raise PermissionDenied(_('アカウントがロックされています'))