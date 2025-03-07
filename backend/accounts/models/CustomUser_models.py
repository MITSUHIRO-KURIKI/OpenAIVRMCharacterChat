from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin,
)
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.template import loader
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import ValidationError
from concurrency.fields import AutoIncVersionField
from common.scripts.DjangoUtils import generate_uuid_hex
from encrypted_fields.fields import (
    SearchField, EncryptedEmailField,
)
from typing import Dict, List, Union, Any


# 拡張ユーザモデル
class CustomUserManager(BaseUserManager):

    use_in_migrations = True

    def _create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValidationError({'email': _('Email address is required')})
        
        try:
            email = self.normalize_email(email)
            validate_email(email)
        except ValidationError:
            raise ValidationError({'email': _('Invalid email address format')})

        email = email.lower()
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        # unique_account_id を付与
        extra_fields.setdefault('unique_account_id', generate_uuid_hex())

        # social_login: password == None を判定条件としてフラグを付与
        ## social_login フラグを立てる
        if password is None:
            extra_fields.setdefault('is_social_login', True)
            extra_fields.setdefault('is_active',       True) # メール認証を行わない

        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        # unique_account_id を付与
        extra_fields.setdefault('unique_account_id', generate_uuid_hex())

        # 管理者権限の付与
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active',    True)                   # メール認証を行わない
        extra_fields.setdefault('date_password_change', timezone.now()) # パスワード設定時刻の登録

        if extra_fields.get('is_staff') is not True: 
            raise ValidationError({'is_staff': _('Superuser must have is_staff=True.')})
        if extra_fields.get('is_superuser') is not True: 
            raise ValidationError({'is_staff': _('Superuser must have is_staff=True.')})

        return self._create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):

    unique_account_id = models.SlugField(
                    verbose_name   = _('アカウントID(自動付与)'),
                    db_index       = True,
                    unique         = True,
                    blank          = False,
                    null           = False,
                    default        = generate_uuid_hex,
                    error_messages = {'unique': _('内部エラー: 申し訳ございません、もう一度登録をお試しください'),},
                    help_text      = _('アカウントID(自動付与)'),)
    _email = EncryptedEmailField(
                    verbose_name = _('メールアドレス(Encrypted:Form使用不可)'),
                    blank        = False,
                    null         = False,
                    max_length   = 255,)
    email  = SearchField(
                    verbose_name   = _('メールアドレス'),
                    hash_key       = settings.ENCRYPTION_HASH_KEY,
                    db_index       = True,
                    unique         = True,
                    error_messages = {'unique': _('This email address cannot be registered'),},
                    help_text      = _('メールアドレス(ユニーク、255文字以下)'),
                    encrypted_field_name = '_email',)
    is_social_login = models.BooleanField(
                    verbose_name = _('ソーシャルログイン'),
                    default      = False,)
    is_active = models.BooleanField(
                    verbose_name = _('アカウントが有効'),
                    default      = False,
                    help_text    = _('無効の場合にはログイン不可になります'),)
    is_staff = models.BooleanField(
                    verbose_name = _('ITスタッフ'),
                    default      = False,
                    help_text    = _('ITスタッフ権限(通常はチェックをつけない)'),)
    is_superuser = models.BooleanField(
                    verbose_name = _('IT管理者'),
                    default      = False,
                    help_text    = _('IT管理者権限(通常はチェックをつけない)'),)
    date_password_change = models.DateTimeField(
                    verbose_name = _('パスワード更新日時'),
                    blank        = True,
                    null         = True,
                    default      = None,
                    help_text    = _('管理者によるパスワード設定の場合には None がセットされます'),)
    date_create = models.DateTimeField(
                    verbose_name = _('作成日時'),
                    default      = timezone.now,
                    help_text    = _('作成日時'),)
    before_last_login = models.DateTimeField(
                    verbose_name = _('前回のログイン日時'),
                    blank        = True,
                    null         = True,
                    default      = None,
                    help_text    = _('前回のログイン日時'),)
    version = AutoIncVersionField()

    USERNAME_FIELD  = 'email' # UNIQUE CustomUser
    REQUIRED_FIELDS = []      # MUST Create Superuser

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def send_mail_user(
            self,
            subject_template_name:str,
            email_template_name:str,
            from_email:Union[str, None]               = None,
            reply_email:Union[str, None]              = None,
            bcc_email:Union[List[str], None]          = None,
            html_email_template_name:Union[str, None] = None,
            context:Union[Dict[str, Any], None]       = None,
            is_send_change_email_address:bool         = False,
            fail_silently:bool                        = False,
        ) -> None:

        from_email  = from_email        if from_email                   else settings.DEFAULT_FROM_EMAIL
        reply_email = reply_email       if reply_email                  else settings.DEFAULT_REPLY_EMAIL
        to_email    = self.change_email if is_send_change_email_address else self.email
        
        subject = loader.render_to_string(subject_template_name, context)
        subject = ''.join(subject.splitlines())
        body    = loader.render_to_string(email_template_name, context)

        email_message = EmailMultiAlternatives(
                            subject    = subject,
                            body       = body,
                            from_email = from_email,
                            to         = [to_email],
                            bcc        = bcc_email,
                            reply_to   = [reply_email],)
        if html_email_template_name is not None:
            html_email = loader.render_to_string(html_email_template_name, context)
            email_message.attach_alternative(html_email, 'text/html')
        email_message.send(fail_silently=fail_silently)

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_absolute_url(self):
        return self

    class Meta(AbstractBaseUser.Meta):
        app_label    = 'accounts'
        db_table     = 'custom_user_model'
        verbose_name = verbose_name_plural = _('01_アカウント情報')