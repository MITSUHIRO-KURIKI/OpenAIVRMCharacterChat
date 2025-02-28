from django.contrib import admin
from django.utils.safestring import mark_safe
from import_export.admin import ExportMixin
from import_export.resources import ModelResource
from .models import Room, RoomSettings, Message, SocketAccess

### Room
class RoomResource(ModelResource):
    class Meta:
        model  = Room
        fields = ('id',
                  'room_id',
                  'create_user',
                  'is_active',
                  'date_create',)
        export_order = fields
        clean_model_instances = True

class RoomAdmin(ExportMixin, admin.ModelAdmin):

    resource_class = RoomResource

    # 一覧画面
    list_display_ = ('room_id',
                     'create_user',
                     'is_active',
                     'date_create',)
    list_filter   = ['is_active',]
    list_display       = list_display_
    list_display_links = list_display_
    search_fields      = ('room_id',)
    ordering           = ('-date_create',)
    
    # 日付のドリルダウンメニュー
    date_hierarchy = 'date_create'
    
    # 表示件数設定
    list_per_page     = 500
    list_max_show_all = 10000
    
    # 作成画面
    add_form      = None
    add_fieldsets = None
    
    # 編集画面
    fieldsets = (
        ('ルーム情報', {'fields': (
            'room_id',
            'create_user',
            'is_active',
            'date_create',
            )}),
    )

    # 権限設定
    # CRUD を True で is_superuser に制限(is_stuff の権限剥奪)
    is_only_superuser_Create = False
    is_only_superuser_Read   = False
    is_only_superuser_Update = False
    is_only_superuser_Delete = False
    
    if is_only_superuser_Create:
        def has_add_permission(self, request) -> bool:
            return request.user.is_superuser
    else:
        def has_add_permission(self, request) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Read:
        def has_module_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
        def has_view_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_module_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
        def has_view_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Update:
        def has_change_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_change_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Delete:
        def has_delete_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_delete_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff

### RoomSettings
class RoomSettingsResource(ModelResource):
    class Meta:
        model  = RoomSettings
        fields = ('id',
                  'room_id',
                  'room_name',
                  'model_name',
                  'system_sentence',
                  'assistant_sentence',
                  'history_len',
                  'max_tokens',
                  'temperature',
                  'top_p',
                  'presence_penalty',
                  'frequency_penalty',
                  'comment',)
        export_order = fields
        clean_model_instances = True

class RoomSettingsAdmin(ExportMixin, admin.ModelAdmin):

    resource_class = RoomSettingsResource

    # 表示する文字数の制限▽
    def character_limit_room_name(self, obj):
        limit=20
        character = obj.room_name
        if len(character)>limit:
            character=character[:limit]+'...'
        return character
    # 表示する文字数の制限△

    # 一覧画面
    list_display_ = ('room_id',
                     'character_limit_room_name',)
    list_filter   = []
    list_display       = list_display_
    list_display_links = list_display_
    search_fields      = ('room_id',
                          'room_name',
                          'model_name',
                          'system_sentence',
                          'assistant_sentence',
                          'comment')
    ordering           = ('-pk',)
    
    # 日付のドリルダウンメニュー
    date_hierarchy = None
    
    # 表示件数設定
    list_per_page     = 500
    list_max_show_all = 10000
    
    # 作成画面
    add_form      = None
    add_fieldsets = None
    
    # 編集画面
    fieldsets = (
        ('ルーム情報', {'fields': (
            'room_id',
            'room_name',
            )}),
        ('モデル', {'fields': (
            'model_name',
            )}),
        ('プロンプト', {'fields': (
            'system_sentence',
            'assistant_sentence',
            'history_len',
            )}),
        ('ハイパラメータ', {'fields': (
            'max_tokens',
            'temperature',
            'top_p',
            'presence_penalty',
            'frequency_penalty',
            )}),
        ('その他', {'fields': (
            'comment',
            )}),
    )

    # 権限設定
    # CRUD を True で is_superuser に制限(is_stuff の権限剥奪)
    is_only_superuser_Create = False
    is_only_superuser_Read   = False
    is_only_superuser_Update = False
    is_only_superuser_Delete = False
    
    if is_only_superuser_Create:
        def has_add_permission(self, request) -> bool:
            return request.user.is_superuser
    else:
        def has_add_permission(self, request) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Read:
        def has_module_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
        def has_view_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_module_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
        def has_view_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Update:
        def has_change_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_change_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Delete:
        def has_delete_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_delete_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff


### Message
class MessageResource(ModelResource):
    class Meta:
        model  = Message
        fields = ('id',
                  'room_id',
                  'message_id',
                  'user_message',
                  'llm_response',
                  'user_settings',
                  'tokens_info_dict',
                  'history_list',
                  'is_active',
                  'date_create',)
        export_order = fields
        clean_model_instances = True

class MessageAdmin(ExportMixin, admin.ModelAdmin):

    resource_class = MessageResource

    # 表示する文字数の制限▽
    def character_limit_user_message(self, obj):
        limit=20
        character = obj.user_message
        if len(character)>limit:
            character=character[:limit]+'...'
        return character
    def character_limit_llm_response(self, obj):
        limit=20
        character = obj.llm_response
        if len(character)>limit:
            character=character[:limit]+'...'
        return character
    # 表示する文字数の制限△

    # 一覧画面
    list_display_ = ('room_id',
                     'character_limit_user_message',
                     'character_limit_llm_response',
                     'is_active',
                     'date_create',)
    list_filter   = ['is_active',]
    list_display       = list_display_
    list_display_links = list_display_
    search_fields      = ('room_id', 'user_message', 'llm_response',)
    ordering           = ('-date_create',)
    
    # 日付のドリルダウンメニュー
    date_hierarchy = 'date_create'
    
    # 表示件数設定
    list_per_page     = 500
    list_max_show_all = 10000
    
    # 作成画面
    add_form      = None
    add_fieldsets = None
    
    # 編集画面
    fieldsets = (
        ('メッセージ情報', {'fields': (
            'room_id',
            'message_id',
            'is_active',
            'date_create',
            )}),
        ('内容', {'fields': (
            'user_message',
            'llm_response',
            'history_list',
            )}),
        ('その他', {'fields': (
            'user_settings',
            'tokens_info_dict',
            )}),
    )

    # 権限設定
    # CRUD を True で is_superuser に制限(is_stuff の権限剥奪)
    is_only_superuser_Create = True
    is_only_superuser_Read   = True
    is_only_superuser_Update = True
    is_only_superuser_Delete = True
    
    if is_only_superuser_Create:
        def has_add_permission(self, request) -> bool:
            return request.user.is_superuser
    else:
        def has_add_permission(self, request) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Read:
        def has_module_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
        def has_view_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_module_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
        def has_view_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Update:
        def has_change_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_change_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff
    if is_only_superuser_Delete:
        def has_delete_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser
    else:
        def has_delete_permission(self, request, obj=None) -> bool:
            return request.user.is_superuser or request.user.is_staff

### SocketAccess
class SocketAccessResource(ModelResource):
    class Meta:
        model  = SocketAccess
        fields = ('room_id',
                  'access_id',
                  'user',
                  'user_name',
                  'channel_name',
                  'request_count',
                  'date_last_request',
                  'date_access',)
        export_order = fields
        clean_model_instances = True

class SocketAccessAdmin(ExportMixin, admin.ModelAdmin):
    resource_class = SocketAccessResource


admin.site.register(Room,         RoomAdmin)
admin.site.register(RoomSettings, RoomSettingsAdmin)
admin.site.register(Message,      MessageAdmin)
admin.site.register(SocketAccess, SocketAccessAdmin)