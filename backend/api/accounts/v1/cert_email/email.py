
from djoser import email
from django.conf import settings
import math

# アカウント本登録
class ActivationEmail(email.ActivationEmail):
    template_name = 'accounts/cert_email/activation.html'
    def get_context_data(self):
        context = super().get_context_data()
        context.update({
            'TOKEN_EXPIRED_MIN': math.floor(settings.PASSWORD_RESET_TIMEOUT / 60),
        })
        return context

# アカウント本登録完了
class ConfirmationEmail(email.ConfirmationEmail):
    template_name = 'accounts/cert_email/confirmation.html'
    def get_context_data(self):
        context = super().get_context_data()
        return context

# パスワード再設定
class PasswordResetEmail(email.PasswordResetEmail):
    template_name = 'accounts/cert_email/password_reset.html'
    def get_context_data(self):
        context = super().get_context_data()
        context.update({
            'TOKEN_EXPIRED_MIN': math.floor(settings.PASSWORD_RESET_TIMEOUT / 60),
        })
        return context

# パスワード再設定完了
class PasswordChangedConfirmationEmail(email.PasswordChangedConfirmationEmail):
    template_name = 'accounts/cert_email/password_changed_confirmation.html'
    def get_context_data(self):
        context = super().get_context_data()
        return context

# メールアドレス変更
class EmailResetEmail(email.UsernameResetEmail):
    template_name = 'accounts/cert_email/email_reset.html'
    def get_context_data(self):
        context = super().get_context_data()
        context.update({
            'TOKEN_EXPIRED_MIN': math.floor(settings.PASSWORD_RESET_TIMEOUT / 60),
        })
        return context

# メールアドレス変更完了
class EmailChangedConfirmationEmail(email.UsernameChangedConfirmationEmail):
    template_name = 'accounts/cert_email/email_changed_confirmation.html'
    def get_context_data(self):
        context = super().get_context_data()
        return context