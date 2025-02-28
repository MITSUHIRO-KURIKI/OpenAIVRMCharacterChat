# Referrer
# https://qiita.com/kenkono/items/d95aee6e79f671c67aba
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from concurrency.fields import AutoIncVersionField
from encrypted_fields.fields import EncryptedFieldMixin

class  EncryptedTextField(EncryptedFieldMixin, models.TextField): 
    pass
class  EncryptedIPAddressField(EncryptedFieldMixin, models.GenericIPAddressField): 
    pass

class BlockIpList(models.Model):
    ip = EncryptedIPAddressField(
                    verbose_name = 'blockedIp',
                    blank        = False,
                    null         = False,)
    reason = EncryptedTextField(
                    verbose_name = 'blockedReasen',
                    blank        = True,
                    null         = True,)
    date_create = models.DateTimeField(
                    verbose_name = 'date_create',
                    blank        = False,
                    null         = False,
                    default      = timezone.now,)
    version = AutoIncVersionField()

    class Meta:
        app_label    = 'access_security'
        db_table     = 'block_ip_list_model'
        verbose_name = verbose_name_plural = _('01_ブロックリスト')