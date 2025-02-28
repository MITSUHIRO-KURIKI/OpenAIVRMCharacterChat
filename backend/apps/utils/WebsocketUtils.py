from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

User = get_user_model()


@database_sync_to_async
def sync_get_user_obj(pk: int):
    """
    非同期対応の Django ORM クエリを使用して、モデルオブジェクトを取得する。

    Args:
        pk (int): プライマリキー。

    Returns:
        Optional[User]: オブジェクト（存在する場合）、または None。
    """
    try:
        return User.objects.get(pk=pk, is_active=True)
    except User.DoesNotExist:
        return None
    except Exception as e:
        print(e)
        return None