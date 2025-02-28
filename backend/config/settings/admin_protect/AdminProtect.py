from django.conf import settings
from django.http import HttpResponseForbidden
from common.scripts.DjangoUtils import RequestUtil

class AdminProtect:
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        url = request.get_full_path()
        
        # 管理サイトに対するアクセス
        if settings.ADMIN_PATH in url:

            # 送信元のIPアドレス
            ip = RequestUtil.get_ip(self, request)

            # 許可IPアドレスリストが空の場合には全てのIPを許可
            if settings.ALLOWED_IP_ADMIN == ['']:
                response = self.get_response(request)
                return response

            # 送信元IPが許可IPアドレスリストに含まれていない場合はForbiddenを返す
            if ip not in settings.ALLOWED_IP_ADMIN:
                if settings.DEBUG:
                    print(f'config.settings.admin_protect.AdminProtect BLOCK: {ip}')
                return HttpResponseForbidden()

        response = self.get_response(request)
        return response