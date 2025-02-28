from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils.timezone import now
from rest_framework.test import APITestCase
from datetime import timedelta
import re
from .datas import api_create_account

UUID_REGEX = re.compile(r'^[0-9a-f]{32}$', re.IGNORECASE)
User = get_user_model()


class UserCreateTestView(APITestCase):

    TARGET_URL = reverse('api.accounts.v1:customuser-list')

    def test_api_allowd_methods(self):
        """ [ALL METHODS] ユーザモデルの登録API """
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

    def test_create_success(self):
        """ [POST] ユーザモデルの登録API (正常系) """

        # 実行前のDB登録数を記録
        before_model_obj_counts = User.objects.count()

        # API 実行
        data     = api_create_account()
        params   = data['valid']['params']
        response = self.client.post(self.TARGET_URL, params, format='json')

        #　レスポンス検証
        self.assertEqual(response.status_code, data['valid']['response']['status_code'])

        # 登録されたユーザーを取得
        user = User.objects.get()

        # モデルの各フィールドの値を検証
        self.assertEqual(user.pk, 1)                              # pk が自動生成されていることを確認
        self.assertEqual(user.email, params['email'])             # リクエストした値が保存されていることを確認
        self.assertTrue(UUID_REGEX.match(user.unique_account_id)) # unique_account_id が自動生成されていることを確認
        self.assertFalse(user.is_social_login)                    # デフォルト値の確認
        self.assertFalse(user.is_active)                          # デフォルト値の確認
        self.assertFalse(user.is_staff)                           # デフォルト値の確認
        self.assertFalse(user.is_superuser)                       # デフォルト値の確認
        self.assertIsNone(user.date_password_change)              # None がセットされていることを確認
        self.assertAlmostEqual(user.date_create,
                               now(),
                               delta=timedelta(seconds=10))       # date_create が 10 秒以内を確認
        self.assertIsNone(user.last_login)                        # None がセットされていることを確認
        self.assertIsNone(user.before_last_login)                 # None がセットされていることを確認
        self.assertEqual(user.version, 1)                         # version が自動生成されていることを確認

        # レスポンス内容の検証
        expected_json_dict = {
            'email': user.email,
        }
        self.assertJSONEqual(response.content, expected_json_dict)

        #　登録数の検証
        self.assertEqual(User.objects.count(), before_model_obj_counts + 1)

    def test_create_invalid_email(self):
        """ [POST] ユーザモデルの登録API (異常系: メールアドレスバリデーションエラー) """
        datas = api_create_account()

        for key, data in datas.items():
            if key.startswith('invalid_email_'):

                # 実行前のDB登録数を記録
                before_model_obj_counts = User.objects.count()

                # API 実行
                params   = data['params']
                response = self.client.post(self.TARGET_URL, params, format='json')

                #　レスポンス検証
                self.assertEqual(response.status_code,               data['response']['status_code'])
                self.assertEqual(response.data['type'],              data['response']['type'])
                self.assertEqual(response.data['errors'][0]['code'], data['response']['errors']['code'])
                self.assertIsNotNone(response.data['errors'][0]['detail'])
                self.assertEqual(response.data['errors'][0]['attr'], data['response']['errors']['attr'])

                #　登録数の検証
                self.assertEqual(User.objects.count(), before_model_obj_counts)

    def test_create_invalid_password(self):
        """ [POST] ユーザモデルの登録API (異常系: パスワードバリデーションエラー) """
        datas = api_create_account()

        for key, data in datas.items():
            if key.startswith('invalid_password_'):

                # 実行前のDB登録数を記録
                before_model_obj_counts = User.objects.count()

                # API 実行
                params   = data['params']
                response = self.client.post(self.TARGET_URL, params, format='json')

                #　レスポンス検証
                self.assertEqual(response.status_code,               data['response']['status_code'])
                self.assertEqual(response.data['type'],              data['response']['type'])
                self.assertEqual(response.data['errors'][0]['code'], data['response']['errors']['code'])
                self.assertIsNotNone(response.data['errors'][0]['detail'])
                self.assertEqual(response.data['errors'][0]['attr'], data['response']['errors']['attr'])

                #　登録数の検証
                self.assertEqual(User.objects.count(), before_model_obj_counts)

    def test_create_blank_email(self):
        """ [POST] ユーザモデルの登録API (異常系: メールアドレス空欄) """
        datas = api_create_account()

        for key, data in datas.items():
            if key.startswith('blank_email_'):

                # 実行前のDB登録数を記録
                before_model_obj_counts = User.objects.count()

                # API 実行
                params   = data['params']
                response = self.client.post(self.TARGET_URL, params, format='json')

                #　レスポンス検証
                self.assertEqual(response.status_code,               data['response']['status_code'])
                self.assertEqual(response.data['type'],              data['response']['type'])
                self.assertEqual(response.data['errors'][0]['code'], data['response']['errors']['code'])
                self.assertIsNotNone(response.data['errors'][0]['detail'])
                self.assertEqual(response.data['errors'][0]['attr'], data['response']['errors']['attr'])

                #　登録数の検証
                self.assertEqual(User.objects.count(), before_model_obj_counts)

    def test_create_blank_password(self):
        """ [POST] ユーザモデルの登録API (異常系: パスワード空欄) """
        datas = api_create_account()

        for key, data in datas.items():
            if key.startswith('blank_password_'):

                # 実行前のDB登録数を記録
                before_model_obj_counts = User.objects.count()

                # API 実行
                params   = data['params']
                response = self.client.post(self.TARGET_URL, params, format='json')

                #　レスポンス検証
                self.assertEqual(response.status_code,               data['response']['status_code'])
                self.assertEqual(response.data['type'],              data['response']['type'])
                self.assertEqual(response.data['errors'][0]['code'], data['response']['errors']['code'])
                self.assertIsNotNone(response.data['errors'][0]['detail'])
                self.assertEqual(response.data['errors'][0]['attr'], data['response']['errors']['attr'])

                #　登録数の検証
                self.assertEqual(User.objects.count(), before_model_obj_counts)

    def test_create_blank_re_password(self):
        """ [POST] ユーザモデルの登録API (異常系: 確認パスワード空欄) """
        datas = api_create_account()

        for key, data in datas.items():
            if key.startswith('blank_re_password_'):

                # 実行前のDB登録数を記録
                before_model_obj_counts = User.objects.count()

                # API 実行
                params   = data['params']
                response = self.client.post(self.TARGET_URL, params, format='json')

                #　レスポンス検証
                self.assertEqual(response.status_code,               data['response']['status_code'])
                self.assertEqual(response.data['type'],              data['response']['type'])
                self.assertEqual(response.data['errors'][0]['code'], data['response']['errors']['code'])
                self.assertIsNotNone(response.data['errors'][0]['detail'])
                self.assertEqual(response.data['errors'][0]['attr'], data['response']['errors']['attr'])

                #　登録数の検証
                self.assertEqual(User.objects.count(), before_model_obj_counts)