from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from common.scripts.DjangoUtils import generate_uuid_hex
from concurrency.fields import AutoIncVersionField
from .Choices import MODEL_NAME_CHOICES
from ..settings import (
    MIN_TOKENS, MAX_TOKENS, MAX_HISSTORY_N,
    MAX_LEN_SYSTEM_SENTENCE, MAX_LEN_ASSISTANT_SENTENCE,
    DEFAULT_ROOM_NAME, MAX_LEN_ROOM_NAME,
)

User = get_user_model()


MODEL_NAME_CHOICES_TUPLE = MODEL_NAME_CHOICES()

class Room(models.Model):

    room_id  = models.SlugField(
                    verbose_name   = _('ルームID'),
                    db_index       = True,
                    unique         = True,
                    blank          = False,
                    null           = False,
                    default        = generate_uuid_hex,)
    create_user = models.ForeignKey(
                    User,
                    verbose_name = _('作成者'),
                    on_delete    = models.CASCADE, # [Memo] CASCADE:親削除子削除, SET_DEFAULT/SET_NULL:親削除子保持
                    blank        = False,
                    null         = False,
                    related_name = 'related_vrmchat_room_model_create_user',
                    help_text    = _('紐づくアカウントID'),)
    is_active = models.BooleanField(
                    verbose_name = _('ルームが有効'),
                    default      = True,
                    help_text    = _('無効の場合にはデータは保持されるがユーザには非表示'),)
    date_create = models.DateTimeField(
                    verbose_name = _('作成日時'),
                    default      = timezone.now,
                    help_text    = _('作成日時'),)
    version = AutoIncVersionField()

    def __str__(self):
        return self.room_id

    def get_absolute_url(self):
        return self

    class Meta:
        app_label    = 'vrmchat'
        db_table     = 'vrmchat_room_model'
        verbose_name = verbose_name_plural = _('01_ルーム情報')

# パラメータのデフォルト値で参照
# https://learn.microsoft.com/ja-jp/azure/ai-services/openai/reference#request-body
class RoomSettings(models.Model):

    room_id = models.OneToOneField(
                    Room,
                    verbose_name = _('ルームID'),
                    db_index     = True,
                    on_delete    = models.CASCADE, # [Memo] CASCADE:親削除子削除, SET_DEFAULT/SET_NULL:親削除子保持
                    blank        = False,
                    null         = False,
                    related_name = 'related_vrmchat_room_settings_model_room_id',
                    help_text    = '紐づくルームID',)
    room_name = models.CharField(
                    verbose_name = _('ルーム名'),
                    default      = DEFAULT_ROOM_NAME,
                    max_length   = MAX_LEN_ROOM_NAME,
                    blank        = False,
                    null         = False,
                    unique       = False,
                    help_text    = str(_('半角英数字 {MAX_LEN_ROOM_NAME}文字以下').format(MAX_LEN_ROOM_NAME=MAX_LEN_ROOM_NAME)),)
    model_name = models.IntegerField(
                    verbose_name = _('使用モデル'),
                    choices      = MODEL_NAME_CHOICES_TUPLE,
                    default      = 1,
                    blank        = False,
                    null         = False,
                    help_text    = _('会話の途中でも変更可能'),)
    system_sentence = models.TextField(
                    verbose_name = _('システムメッセージ'),
                    max_length   = MAX_LEN_SYSTEM_SENTENCE,
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,
                    help_text    = str(_('最大{MAX_LEN_SYSTEM_SENTENCE}文字').format(MAX_LEN_SYSTEM_SENTENCE=MAX_LEN_SYSTEM_SENTENCE)),)
    assistant_sentence = models.TextField(
                    verbose_name = _('アシスタントメッセージ'),
                    max_length   = MAX_LEN_ASSISTANT_SENTENCE,
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,
                    help_text    = str(_('最大{MAX_LEN_ASSISTANT_SENTENCE}文字').format(MAX_LEN_ASSISTANT_SENTENCE=MAX_LEN_ASSISTANT_SENTENCE)),)
    history_len = models.IntegerField(
                    verbose_name = 'history_len',
                    default      = 1,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(0), MaxValueValidator(MAX_HISSTORY_N)],
                    help_text    = str(_('ヒストリーに含める直近の会話数(最大{MAX_HISSTORY_N})').format(MAX_HISSTORY_N=MAX_HISSTORY_N)),)
    max_tokens = models.IntegerField(
                    verbose_name = 'max_tokens',
                    default      = 256,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(MIN_TOKENS), MaxValueValidator(MAX_TOKENS)],
                    help_text    = str(_('生成されるトークンの最大長(最大{MAX_TOKENS})').format(MAX_TOKENS=MAX_TOKENS)),)
    temperature = models.FloatField(
                    verbose_name = 'temperature',
                    default      = 1.0,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(0), MaxValueValidator(2)],
                    help_text    = _('生成するテキストのランダム性(between 0 and 2)'),)
    top_p = models.FloatField(
                    verbose_name = 'top_p',
                    default      = 1.0,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(0), MaxValueValidator(1)],
                    help_text    = _('単語の選択性(between 0 and 1)'),)
    presence_penalty = models.FloatField(
                    verbose_name = 'presence_penalty',
                    default      = 0,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(-2), MaxValueValidator(2)],
                    help_text    = _('既出単語への一定ペナルティ(between -2 and 2)'),)
    frequency_penalty = models.FloatField(
                    verbose_name = 'frequency_penalty',
                    default      = 0,
                    blank        = False,
                    null         = False,
                    validators   = [MinValueValidator(-2), MaxValueValidator(2)],
                    help_text    = _('既出単語の出現回数へのペナルティ(between -2 and 2)'),)
    comment = models.TextField(
                    verbose_name = _('コメント/メモ'),
                    max_length   = 256,
                    default      = None,
                    blank        = True,
                    null         = True,
                    unique       = False,
                    help_text    = _('半角英数字 256文字以下'),)
    version = AutoIncVersionField()

    def get_absolute_url(self):
        return self

    class Meta:
        app_label    = 'vrmchat'
        db_table     = 'vrmchat_room_settings_model'
        verbose_name = verbose_name_plural = _('02_ルーム設定')

# Room 作成と同時に RoomSettings を作成
@receiver(post_save, sender=Room)
def create_related_model_for_room_model(sender, instance, created, **kwargs):
    # Room モデルの新規作成時のみ実行
    if created:
        # レコードが存在しない場合作成 / 存在する場合はレコードを返す
        _ = RoomSettings.objects.get_or_create(room_id = instance)