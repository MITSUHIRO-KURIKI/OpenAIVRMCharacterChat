from django.db import models
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from common.scripts.DjangoUtils import generate_uuid_hex
from concurrency.fields import AutoIncVersionField
from .Room_models import Room


class Message(models.Model):

    room_id = models.ForeignKey(
                    Room,
                    verbose_name = _('ルームID'),
                    db_index     = True,
                    on_delete    = models.CASCADE, # [Memo] CASCADE:親削除子削除, SET_DEFAULT/SET_NULL:親削除子保持
                    blank        = False,
                    null         = False,
                    related_name = 'related_vrmchat_message_model_room_id',
                    help_text    = _('紐づくルームID'),)
    message_id  = models.SlugField(
                    verbose_name   = _('メッセージID'),
                    db_index       = True,
                    unique         = True,
                    blank          = False,
                    null           = False,
                    default        = generate_uuid_hex,)
    user_message = models.TextField(
                    verbose_name = _('ユーザメッセージ'),
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,)
    llm_response = models.TextField(
                    verbose_name = _('LLM回答'),
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,)
    user_settings = models.TextField(
                    verbose_name = _('ユーザのLLM設定'),
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,)
    tokens_info_dict = models.TextField(
                    verbose_name = _('トークン情報'),
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,)
    history_list = models.TextField(
                    verbose_name = _('参照した過去の会話履歴'),
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,)
    is_active = models.BooleanField(
                    verbose_name = _('メッセージが有効'),
                    default      = True,
                    help_text    = _('無効の場合にはデータは保持されるがユーザには非表示'),)
    date_create = models.DateTimeField(
                    verbose_name = _('作成日時'),
                    default      = timezone.now,
                    help_text    = _('作成日時'),)
    version = AutoIncVersionField()

    def __str__(self):
        return self.message_id

    def get_absolute_url(self):
        return self

    class Meta:
        app_label    = 'vrmchat'
        db_table     = 'vrmchat_message_model'
        verbose_name = verbose_name_plural = _('10_メッセージ一覧')