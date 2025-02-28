
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken
from djoser.utils import encode_uid
import random
import string
from time import sleep
from typing import Tuple

User = get_user_model()


def create_test_user(email:str      = 'createtestuser@example.com',
                     password:str   = 'bqKXhKQR6AxE',
                     *,
                     is_active:bool          = True,
                     return_sleep_time:float = None,
                     ) -> Tuple[User, str, str]:
    """
    テスト用のユーザーを作成し、トークンを生成する。

    Parameters:
        email (str):      作成するユーザーのメールアドレス (デフォルト: 'createtestuser@example.com')。
        password (str):   作成するユーザーのパスワード     (デフォルト: 'bqKXhKQR6AxE')。
        is_active (bool): ユーザーのアクティブ状態。
            - True: ユーザーがアクティブ (通常のログインやJWTトークン認証が可能)。
            - False: ユーザーが非アクティブ (認証不可、通常はアカウントの確認やアクティベーション待ちの状態)。
        return_sleep_time (float): トークンの有効期限を切るなどで sleep する必要がある場合に時間を設定。 (デフォルト: None)。

    Returns:
        tuple: (user, identifier_1, identifier_2)
            - user (User): ユーザーインスタンス。
            - identifier_1 (str):
                - is_active=Trueの場合:  JWT形式のアクセストークン。
                - is_active=Falseの場合: エンコードされたUID (Djoserアクティベーションで使用)。
            - identifier_2 (str):
                - is_active=Trueの場合:  JWT形式のリフレッシュトークン。
                - is_active=Falseの場合: アクティベーション用のトークン (Djoserで使用)。

    Example Usage:
        # アクティベートされたユーザーを作成
        user, access_token, refresh_token = create_test_user()
        # アクティベートされていないユーザーを作成
        user, uid, activation_token = create_test_user(is_active=False)
    """

    user = User.objects.create_user(
        email    = email,
        password = password,
    )

    if is_active:
        user.is_active = True
        user.save()
        # トークン生成
        refresh = RefreshToken.for_user(user)
        if return_sleep_time:
            sleep(return_sleep_time)
        return user, str(refresh.access_token), str(refresh)
    else:
        uid   = encode_uid(user.pk)
        token = default_token_generator.make_token(user)
        if return_sleep_time:
            sleep(return_sleep_time)
        return user, str(uid), str(token)

def create_dummy_user(n:int=20, domain:str='dummy.example.com') -> None:
    """
    ダミーユーザー(is_active=True)を作成し、データベースに保存する。
    
    Args:
        n (int): 作成するダミーユーザーの数（デフォルト20）。
        domain (str): メールアドレスに使用するドメイン（デフォルト 'dummy.example.com'）。
    """
    for _ in range(n):
        username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        try:
            User.objects.create_user(
                email     = f'{username}@{domain}',
                password  = generate_dummy_password(),
                is_active = True,
            )
        except Exception as e:
            print(f'Failed to create user {username}: {e}')
    # is_active=Trueのユーザー数を出力
    active_user_count = User.objects.filter(is_active=True).count()
    print(f'\n[INFO] Number of active users: {active_user_count}')

def generate_dummy_password(min_length:int=12) -> str:
    """
    指定されたルールに従ってランダムなダミーパスワードを生成する。
    
    Args:
        min_length (int): パスワードの最小文字数（デフォルト12）。

    Returns:
        str: 生成されたパスワード。
    """
    # 必須要素のセット
    lower   = random.choice(string.ascii_lowercase)  # 小文字
    upper   = random.choice(string.ascii_uppercase)  # 大文字
    digit   = random.choice(string.digits)           # 数字
    special = random.choice('!@#$%^&*()-_')          # 特殊文字
    
    # 必須要素を含むようにランダム生成
    remaining_length = max(min_length - 4, 0)  # 必須文字を除いた残りの長さ
    pool             = string.ascii_letters + string.digits + '!@#$%^&*()-_'
    remaining_chars  = ''.join(random.choices(pool, k=remaining_length))
    
    # パスワードのシャッフル
    password = lower + upper + digit + special + remaining_chars
    password = ''.join(random.sample(password, len(password)))
    
    return password