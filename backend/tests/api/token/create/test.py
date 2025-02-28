from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils.timezone import now
from rest_framework.test import APITestCase
from datetime import timedelta
from time import sleep
from tests.common import create_test_user
from common.lib.axes.models import AccessAttempt

User = get_user_model()


class UserLoginTestView(APITestCase):

    TARGET_URL       = reverse('api.token.v1:create')
    TOKEN_VERIFY_URL = reverse('api.token.v1:verify')

    def setUp(self):
        # ユーザーを作成
        self.password = 'bqKXhKQR6AxE'
        self.user, self.access_token, self.refresh_token = create_test_user(password=self.password, is_active=True)

        # ユーザが作成できたこと確認
        self.assertIsNotNone(self.user)
        self.assertIsNotNone(self.access_token)
        self.assertIsNotNone(self.refresh_token)

    def test_api_allowd_methods(self):
        """ [ALL METHODS] ユーザログインAPI """
        # テストするHTTPメソッドと対応する関数
        methods = [
            ('get',     {}, 405),
            ('post',    {}, 400), # 許可
            ('put',     {}, 405),
            ('delete',  {}, 405),
            ('patch',   {}, 405),
            ('options', {}, 200), # 許可
            ('head',    {}, 405),
        ]

        for method, data, expected_status in methods:
            with self.subTest(method=method):
                response = getattr(self.client, method)(self.TARGET_URL, data)
                self.assertEqual(response.status_code, expected_status)

    def test_login_success(self):
        """ [POST] ユーザログインAPI (正常系) """
        # ログインに必要なデータ
        params = {
            'email':    self.user.email,
            'password': self.password,
        }

        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが200 (OK)であることを確認
        self.assertEqual(response.status_code, 200)

        if not settings.IS_RESPONSE_JWT_COOKIE:
            # トークンの値取得
            access_token_value  = response.data['access']
            refresh_token_value = response.data['refresh']
        else:
            # クライアントのCookieを取得
            access_cookie  = self.client.cookies.get('access')
            refresh_cookie = self.client.cookies.get('refresh')

            # トークンの値取得
            access_token_value  = access_cookie.value
            refresh_token_value = refresh_cookie.value

            # クッキーが設定されていることを確認
            self.assertIsNotNone(access_cookie)
            self.assertIsNotNone(refresh_cookie)

            # クッキー属性の確認
            ## httponly
            self.assertTrue(access_cookie.get('httponly'))
            self.assertTrue(refresh_cookie.get('httponly'))
            ## secure
            self.assertTrue(access_cookie.get('secure'))
            self.assertTrue(refresh_cookie.get('secure'))
            ## samesite
            self.assertEqual(access_cookie.get('samesite'),  'Lax')
            self.assertEqual(refresh_cookie.get('samesite'), 'Lax')
            ## max-age
            self.assertEqual(
                access_cookie.get('max-age'),
                int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
            )
            self.assertEqual(
                refresh_cookie.get('max-age'),
                int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
            )

        # アクセストークンとリフレッシュトークンの形式が正しいことを確認
        self.assertIsInstance(access_token_value,  str)
        self.assertIsInstance(refresh_token_value, str)
        # アクセストークンとリフレッシュトークンが非空であることを確認
        self.assertGreater(len(access_token_value),  0)
        self.assertGreater(len(refresh_token_value), 0)

        # トークンの検証
        access_token_verify_params    = {'token': access_token_value,}
        refresh_token_verify_params   = {'token': refresh_token_value,}
        access_token_verify_response  = self.client.post(self.TOKEN_VERIFY_URL, access_token_verify_params,  format='json')
        refresh_token_verify_response = self.client.post(self.TOKEN_VERIFY_URL, refresh_token_verify_params, format='json')

        # ステータスコードが 200 (OK)であることを確認
        self.assertEqual(access_token_verify_response.status_code,  200)
        self.assertEqual(refresh_token_verify_response.status_code, 200)

    def test_login_last_login_updated(self):
        """ [POST] ユーザログインAPI (正常系: last_login が更新されていることを確認) """

        # 初期状態で last_login が None であることを確認
        self.assertIsNone(self.user.last_login)

        # ログイン成功
        params = {
            'email':    self.user.email,
            'password': self.password,
        }
        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')
        # ステータスコードが 200 (OK) であることを確認
        self.assertEqual(response.status_code, 200)

        # ユーザーを再取得して last_login が 10 秒以内を確認
        self.user.refresh_from_db()
        self.assertAlmostEqual(self.user.last_login,
                               now(),
                               delta=timedelta(seconds=10))

        # last_login のタイムスタンプがユーザー作成時刻以降であることを確認
        self.assertGreater(self.user.last_login, self.user.date_create)

    def test_login_before_last_login_updated(self):
        """ [POST] ユーザログインAPI (正常系: before_last_login が更新されていることを確認) """

        # 初期状態で before_last_login/last_login が None であることを確認
        self.assertIsNone(self.user.before_last_login)
        self.assertIsNone(self.user.last_login)

        # ログイン成功(1回目)
        params = {
            'email':    self.user.email,
            'password': self.password,
        }
        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')
        # ステータスコードが 200 (OK) であることを確認
        self.assertEqual(response.status_code, 200)

        # ユーザーを再取得して last_login が 10 秒以内を確認
        self.user.refresh_from_db()
        self.assertAlmostEqual(self.user.last_login,
                               now(),
                               delta=timedelta(seconds=10))
        # last_login のタイムスタンプがユーザー作成時刻以降であることを確認
        self.assertGreater(self.user.last_login, self.user.date_create)

        before_last_login = self.user.last_login

        # ログイン成功(2回目)
        params = {
            'email':    self.user.email,
            'password': self.password,
        }
        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')
        # ステータスコードが 200 (OK) であることを確認
        self.assertEqual(response.status_code, 200)
        
        # last_login と before_last_login が異なる
        # 前回ログイン日時が before_last_login に入っていることを確認
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.last_login,     before_last_login)
        self.assertEqual(self.user.before_last_login, before_last_login)

    def test_login_axes_failure_count_and_reset(self):
        """ [POST] ユーザログインAPI (正常系: ログイン失敗記録と成功時リセット(AXES)) """

        # 失敗回数を記録しているか確認
        for i in range(3):
            params = {
                'email':    self.user.email,
                'password': 'invalidpassword',  # 無効なパスワード
            }
            response = self.client.post(self.TARGET_URL, params, format='json')
            # ステータスコード 401 確認
            self.assertEqual(response.status_code, 401)

            # アクセス失敗回数を取得
            failures = (
                AccessAttempt.objects.filter(username=self.user.email)
                .values('failures_since_start')
                .first()
            )

            # 失敗回数が期待値と一致することを確認
            self.assertEqual(failures['failures_since_start'], 1 + i)

        # ログイン成功
        params = {
            'email':    self.user.email,
            'password': self.password,
        }
        # API 実行
        _ = self.client.post(self.TARGET_URL, params, format='json')
        # データが削除されていることを確認
        self.assertFalse(AccessAttempt.objects.filter(username=self.user.email).exists())

    def test_login_invalid_access_token_timeout(self):
        """ [POST] ユーザログインAPI (異常系: トークンのタイムアウト) """
        """ SIMPLE_JWT は override_settings で変更できないので注意 """
        # ログインに必要なデータ
        params = {
            'email':    self.user.email,
            'password': self.password,
        }

        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')

        if not settings.IS_RESPONSE_JWT_COOKIE:
            # トークンの値取得
            access_token_value  = response.data['access']
            refresh_token_value = response.data['refresh']
        else:
            # クライアントのCookieを取得
            access_cookie  = self.client.cookies.get('access')
            refresh_cookie = self.client.cookies.get('refresh')
            # トークンの値取得
            access_token_value  = access_cookie.value
            refresh_token_value = refresh_cookie.value

        # トークンの検証
        access_token_verify_params  = {'token': access_token_value,}
        refresh_token_verify_params = {'token': refresh_token_value,}
        ## ステータスコードが 200/200 -> 401/200 -> 401/401 を確認
        access_token_verify_response  = self.client.post(self.TOKEN_VERIFY_URL, access_token_verify_params,  format='json')
        refresh_token_verify_response = self.client.post(self.TOKEN_VERIFY_URL, refresh_token_verify_params, format='json')
        self.assertEqual(access_token_verify_response.status_code,  200)
        self.assertEqual(refresh_token_verify_response.status_code, 200)
        sleep(1)
        access_token_verify_response  = self.client.post(self.TOKEN_VERIFY_URL, access_token_verify_params,  format='json')
        refresh_token_verify_response = self.client.post(self.TOKEN_VERIFY_URL, refresh_token_verify_params, format='json')
        self.assertEqual(access_token_verify_response.status_code,  401)
        self.assertEqual(access_token_verify_response.data['type']             , 'client_error')
        self.assertEqual(access_token_verify_response.data['errors'][0]['code'], 'token_not_valid')
        self.assertEqual(access_token_verify_response.data['errors'][1]['code'], 'token_not_valid')
        self.assertIsNotNone(access_token_verify_response.data['errors'][0]['detail'])
        self.assertIsNotNone(access_token_verify_response.data['errors'][1]['detail'])
        self.assertIsNotNone(access_token_verify_response.data['errors'][0]['attr'])
        self.assertIsNotNone(access_token_verify_response.data['errors'][1]['attr'])
        self.assertEqual(refresh_token_verify_response.status_code, 200)
        sleep(2)
        access_token_verify_response  = self.client.post(self.TOKEN_VERIFY_URL, access_token_verify_params,  format='json')
        refresh_token_verify_response = self.client.post(self.TOKEN_VERIFY_URL, refresh_token_verify_params, format='json')
        self.assertEqual(access_token_verify_response.status_code,  401)
        self.assertEqual(refresh_token_verify_response.status_code, 401)
        self.assertEqual(refresh_token_verify_response.data['type']             , 'client_error')
        self.assertEqual(refresh_token_verify_response.data['errors'][0]['code'], 'token_not_valid')
        self.assertEqual(refresh_token_verify_response.data['errors'][1]['code'], 'token_not_valid')
        self.assertIsNotNone(refresh_token_verify_response.data['errors'][0]['detail'])
        self.assertIsNotNone(refresh_token_verify_response.data['errors'][1]['detail'])
        self.assertIsNotNone(refresh_token_verify_response.data['errors'][0]['attr'])
        self.assertIsNotNone(refresh_token_verify_response.data['errors'][1]['attr'])

    def test_login_invalid_credentials(self):
        """ [POST] ユーザログインAPI (異常系: 無効な認証情報) """
        invalid_params = [
            {
                'email':    'nonexistent@example.com', # 存在しないメール
                'password': self.password,
            },
            {
                'email':    self.user.email,
                'password': 'wrongpassword',           # パスワード不備
            },
        ]
        for params in invalid_params:
            with self.subTest(params=params):
                # API 実行
                response = self.client.post(self.TARGET_URL, params, format='json')

                # ステータスコード 401 確認
                self.assertEqual(response.status_code, 401)
                self.assertEqual(response.data['type']             , 'client_error')
                self.assertEqual(response.data['errors'][0]['code'], 'no_active_account')
                self.assertIsNotNone(response.data['errors'][0]['detail'])

    def test_login_blank_email(self):
        """ [POST] ユーザログインAPI (異常系: メール空欄) """
        params = {
            'email':    '',
            'password': self.password,
        }

        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコード 400 確認
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['type']             , 'validation_error')
        self.assertEqual(response.data['errors'][0]['code'], 'blank')
        self.assertEqual(response.data['errors'][0]['attr'], 'email')
        self.assertIsNotNone(response.data['errors'][0]['detail'])

    def test_login_blank_password(self):
        """ [POST] ユーザログインAPI (異常系: パスワード空欄) """
        params = {
            'email':    self.user.email,
            'password': '',
        }

        # API 実行
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコード 400 確認
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['type']             , 'validation_error')
        self.assertEqual(response.data['errors'][0]['code'], 'blank')
        self.assertEqual(response.data['errors'][0]['attr'], 'password')
        self.assertIsNotNone(response.data['errors'][0]['detail'])