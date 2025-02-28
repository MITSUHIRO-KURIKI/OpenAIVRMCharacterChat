from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from common.scripts.DjangoUtils import generate_uuid_hex
from concurrency.fields import AutoIncVersionField
from .Room_models import Room

User = get_user_model()


class SocketAccess(models.Model):

    room_id = models.ForeignKey(
                    Room,
                    verbose_name = _('ステージID'),
                    db_index     = True,
                    on_delete    = models.CASCADE, # [Memo] CASCADE:親削除子削除, SET_DEFAULT/SET_NULL:親削除子保持
                    blank        = False,
                    null         = False,
                    related_name = 'related_vrmchat_socket_access_model_stage_id',
                    help_text    = _('紐づくステージID'),)
    access_id  = models.SlugField(
                    verbose_name   = _('アクセスID'),
                    db_index       = True,
                    unique         = True,
                    blank          = False,
                    null           = False,
                    default        = generate_uuid_hex,)
    user = models.ForeignKey(
                    User,
                    verbose_name = _('接続ユーザ'),
                    on_delete    = models.CASCADE, # [Memo] CASCADE:親削除子削除, SET_DEFAULT/SET_NULL:親削除子保持
                    blank        = True,
                    null         = True,
                    related_name = 'related_vrmchat_socket_access_model_user',
                    help_text    = _('紐づくアカウントID'),)
    user_name = models.CharField(
                    verbose_name = _('ユーザ名'),
                    max_length   = 25,
                    default      = '',
                    blank        = True,
                    null         = True,
                    unique       = False,
                    help_text    = _('半角英数字 25文字以内'),)
    channel_name = models.CharField(
                    verbose_name = 'channel_name',
                    max_length   = 255,
                    default      = 'None',
                    blank        = False,
                    null         = False,
                    unique       = False,
                    help_text    = _('django-channels で生成される接続ごとにユニークなもの'),)
    request_count = models.IntegerField(
                    verbose_name = _('リクエスト回数'),
                    default      = 0,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(0)],
                    help_text    = _('リクエスト回数'),)
    date_last_request = models.DateTimeField(
                    verbose_name = _('最終リクエスト日時'),
                    default      = timezone.now,
                    help_text    = _('最終リクエスト日時'),)
    date_access = models.DateTimeField(
                    verbose_name = _('アクセス日時'),
                    default      = timezone.now,
                    help_text    = _('アクセス日時'),)
    version = AutoIncVersionField()

    def __str__(self):
        return self.access_id

    def get_absolute_url(self):
        return self

    class Meta:
        app_label    = 'vrmchat'
        db_table     = 'vrmchat_socket_access_model'
        verbose_name = verbose_name_plural = _('40_Socketアクセス状況')