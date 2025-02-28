from django.conf import settings
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # admin
    path(settings.ADMIN_PATH+'/', admin.site.urls),
    # api
    ## accounts
    path('backendapi/accounts/',    include('api.accounts.v1.urls')),
    path('backendapi/v1/accounts/', include('api.accounts.v1.urls')),
    # third_party
    path('backendapi/third_party/',    include('api.third_party.v1.urls')),
    path('backendapi/v1/third_party/', include('api.third_party.v1.urls')),
    # token
    path('backendapi/token/',    include('api.token.v1.urls')),
    path('backendapi/v1/token/', include('api.token.v1.urls')),
    # user_properties
    path('backendapi/user_properties/',    include('api.user_properties.v1.urls')),
    path('backendapi/v1/user_properties/', include('api.user_properties.v1.urls')),
    # vrmchat
    path('backendapi/vrmchat/',    include('api.vrmchat.v1.urls')),
    path('backendapi/v1/vrmchat/', include('api.vrmchat.v1.urls')),
]

# https://github.com/django/django/blob/main/django/conf/urls/__init__.py
handler400 = 'common.custom_error_handlers.custom_bad_request'
handler403 = 'common.custom_error_handlers.custom_permission_denied'
handler404 = 'common.custom_error_handlers.custom_page_not_found'
handler500 = 'common.custom_error_handlers.custom_server_error'

# 内部 static を配信する
import os
from django.urls import re_path
from django.views.static import serve
urlpatterns += [ re_path(r'^static/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'static/')}, name='static_urlpattern') ]
# urlpatterns += [ re_path(r'^static/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'staticfiles/')}, name='staticfiles_urlpattern') ]

# DEBUG
if settings.DEBUG:
    # media を利用
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    # ADD drf-spectacular
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
    urlpatterns += [
        # スキーマ表示 / Swagger UI / ReDoc
        path('backendapi/schema/',            SpectacularAPIView.as_view(),                              name='openapi-schema'),
        path('backendapi/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='openapi-schema'), name='swagger-ui'),
        path('backendapi/schema/redoc/',      SpectacularRedocView.as_view(url_name='openapi-schema'),   name='redoc'),
    ]