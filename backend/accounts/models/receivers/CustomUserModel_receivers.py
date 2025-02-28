from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.user_properties.models import (
    UserProfile, UserReceptionSetting,
)

User = get_user_model()


# CustomUser 作成と同時に UserProfile と UserReceptionSetting を作成
@receiver(post_save, sender=User)
def create_related_model_for_custom_user_model(sender, instance, created, **kwargs):
    # User モデルの新規作成時のみ実行
    if created:
        # レコードが存在しない場合作成 / 存在する場合はレコードを返す(通常発生しない)
        _ = UserProfile.objects.get_or_create(unique_account_id = instance)
        _ = UserReceptionSetting.objects.get_or_create(unique_account_id = instance)