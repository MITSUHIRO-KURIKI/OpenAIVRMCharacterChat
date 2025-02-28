from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APITestCase
from tests.common import create_test_user
from time import sleep

User = get_user_model()


class UserActivationTestView(APITestCase):

    TARGET_URL = reverse('api.accounts.v1:customuser-activation')

    def setUp(self):
        # ユーザーを作成
        self.user, self.uid, self.token = create_test_user(is_active=False)

        # ユーザが作成できたこと確認
        self.assertIsNotNone(self.user)
        self.assertIsNotNone(self.uid)
        self.assertIsNotNone(self.token)

    def test_api_allowd_methods(self):
        """ [ALL METHODS] ユーザアクティベートAPI """
        # テストするHTTPメソッドと対応する関数
        methods = [
            ('get',     {}, 401),
            ('post',    {}, 400), # 許可
            ('put',     {}, 401),
            ('delete',  {}, 401),
            ('patch',   {}, 401),
            ('options', {}, 401),
            ('head',    {}, 401),
        ]

        for method, data, expected_status in methods:
            with self.subTest(method=method):
                response = getattr(self.client, method)(self.TARGET_URL, data)
                self.assertEqual(response.status_code, expected_status)

    def test_activation_success(self):
        """ [POST] ユーザアクティベートAPI (正常系) """

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # API 実行
        params = {
            'uid':   self.uid,
            'token': self.token,
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが204 (No Content)であることを確認
        self.assertEqual(response.status_code, 204)

        # ユーザーがアクティベートされていることを確認
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    @override_settings(PASSWORD_RESET_TIMEOUT = 0,)
    def test_activation_invalid_token_timeout(self):
        """ [POST] ユーザアクティベートAPI (異常系: トークンのタイムアウト) """
        # トークンのタイムアウト用
        sleep(1)

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # 無効なトークンでリクエスト
        params = {
            'uid':   self.uid,
            'token': self.token,
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが 400 (Bad Request)であることを確認
        self.assertEqual(response.status_code, 400)

        # ユーザーがアクティベートされていないこと確認
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activation_invalid_token(self):
        """ [POST] ユーザアクティベートAPI (異常系: 無効なトークン) """

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # 無効なトークンでリクエスト
        params = {
            'uid':   self.uid,
            'token': 'invalidtoken',
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが 400 (Bad Request)であることを確認
        self.assertEqual(response.status_code, 400)

        # ユーザーがアクティブ化されていないことを確認
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activation_invalid_uid(self):
        """ [POST] ユーザアクティベートAPI (異常系: 無効なUID) """

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # 無効なUIDでリクエスト
        params = {
            'uid':   'invaliduid',
            'token': self.token,
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが 400 (Bad Request)であることを確認
        self.assertEqual(response.status_code, 400)

        # ユーザーがアクティブ化されていないことを確認
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activation_invalid_missing_params(self):
        """ [POST] ユーザアクティベートAPI (異常系: パラメータ不足) """

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # パラメータなしでリクエスト
        response = self.client.post(self.TARGET_URL, {}, format='json')

        # ステータスコードが 400 (Bad Request)であることを確認
        self.assertEqual(response.status_code, 400)

        # ユーザーがアクティブ化されていないことを確認
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activation_invalid_already_activated(self):
        """ [POST] ユーザアクティベートAPI (異常系: 既にアクティベート済み) """
        # ユーザーをアクティブ化
        self.user.is_active = True
        self.user.save()
        self.assertTrue(self.user.is_active)

        # アクティブ化済みユーザーでリクエスト
        params = {
            'uid':   self.uid,
            'token': self.token,
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが 403 (Forbidden)であることを確認
        self.assertEqual(response.status_code, 403)

        # ユーザーがアクティブなままであることを確認
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_activation_blank_token(self):
        """ [POST] ユーザアクティベートAPI (異常系: トークン空欄) """

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # 無効なトークンでリクエスト
        params = {
            'uid':   self.uid,
            'token': '',
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが 400 (Bad Request)であることを確認
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['type']             , 'validation_error')
        self.assertEqual(response.data['errors'][0]['code'], 'blank')
        self.assertEqual(response.data['errors'][0]['attr'], 'token')
        self.assertIsNotNone(response.data['errors'][0]['detail'])

        # ユーザーがアクティブ化されていないことを確認
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activation_blank_uid(self):
        """ [POST] ユーザアクティベートAPI (異常系: UID空欄) """

        # ユーザーがアクティベートされていないこと確認
        self.assertFalse(self.user.is_active)

        # 無効なUIDでリクエスト
        params = {
            'uid':   '',
            'token': self.token,
        }
        response = self.client.post(self.TARGET_URL, params, format='json')

        # ステータスコードが 400 (Bad Request)であることを確認
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['type']             , 'validation_error')
        self.assertEqual(response.data['errors'][0]['code'], 'blank')
        self.assertEqual(response.data['errors'][0]['attr'], 'uid')
        self.assertIsNotNone(response.data['errors'][0]['detail'])

        # ユーザーがアクティブ化されていないことを確認
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)