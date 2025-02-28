from channels.db import database_sync_to_async
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import asyncio
import brotli
import json
from api.utils import jwt_auth_get_id
from common.scripts.DjangoUtils import generate_uuid_hex
from common.scripts.LlmUtils import create_messages, calc_token, is_tokens_less_than_settings
from common.scripts.LlmUtils.llms import OpenAILlm, GcloudLlm
from apps.utils import sync_get_user_obj
from ..settings import (
    SOCKET_REQUEST_PER_SEC_LIMIT, SOCKET_REXEIVE_DATA_KB_LIMIT,
    SEND_MAX_TOKENS,
)
from ..models import (
    Room, SocketAccess,
    MODEL_NAME_CHOICES,
)
from ..utils import (
    sync_get_room_obj,
    get_room_settings, get_history,
    sync_save_message_models,
    replace_room_name_check,
    base_prompt,
)


MODEL_NAME_CHOICES_DICT = dict(MODEL_NAME_CHOICES())


class VrmchatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.room_id    = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f'room_{self.room_id}'

        # ユーザの取得と初期化 ▽
        user_id = jwt_auth_get_id(self.scope['cookies'])
        if user_id:
            self.connect_user  = await sync_get_user_obj(user_id)
        else:
            self.connect_user  = None
        # ユーザの取得と初期化 △
        # ルームの取得 ▽
        room_obj = await sync_get_room_obj(self.room_id)
        # ルームの取得 △

        # アクセス制御 ▽
        ## ユーザが存在しない場合は接続を拒否
        if not self.connect_user:
            await self.close()
            raise StopConsumer()
        ## ルームが存在しない場合は接続を拒否
        if not room_obj:
            await self.close()
            raise StopConsumer()
        # アクセス制御 △

        # connect: group_name
        await self.channel_layer.group_add(self.group_name,
                                           self.channel_name,)
        await self.accept()
        asyncio.create_task(self._handle_connect(self.room_id,
                                                 self.channel_name,
                                                 self.connect_user,))

    async def disconnect(self, close_code):
        try:
            # disconnect: group_name
            await self.channel_layer.group_discard(self.group_name,
                                                   self.channel_name,)
            asyncio.create_task(self._handle_disconnect(self.room_id, self.channel_name,))
        except Exception as e:
            print(e)
            pass
        finally:
            # クリーンに接続を閉じる
            await self.close()
            raise StopConsumer()

    async def receive(self, text_data=None, bytes_data=None):
        asyncio.create_task(self._handle_receive(text_data, bytes_data))

    # ------------------------------
    # safety
    @database_sync_to_async
    def _request_count_and_check_socket_access(self, access_id:str):
        # 短期間のリクエストを遮断する
        try:
            check_result = True

            socket_access_obj = SocketAccess.objects.filter(access_id = access_id).first()
            now_utc_sec       = int(timezone.now().timestamp())
            # socket_access_obj が作成されていなければ一旦Trueする
            if socket_access_obj:
                date_access_sec       = int(socket_access_obj.date_access.timestamp())
                date_last_request_sec = int(socket_access_obj.date_last_request.timestamp())

                # アクセスの2秒後からチェックを開始する
                if now_utc_sec - date_access_sec >= 2:
                    # 1秒間のアクセスをカウントする
                    if now_utc_sec - date_last_request_sec < 1:
                        request_count = socket_access_obj.request_count + 1
                    else:
                        request_count = 1
                        socket_access_obj.date_last_request = timezone.now()
                    socket_access_obj.request_count = request_count
                    socket_access_obj.save()
                    
                    # 規定回数を超えたらアクセスを遮断
                    if request_count > SOCKET_REQUEST_PER_SEC_LIMIT:
                        check_result = False

            return check_result
        except Exception as e:
            print(e)
            return False

    async def _check_text_data_byte(self, text_data):
        try:
            check_result     = True
            kilobytes_length = len(text_data.encode('CP932')) / 1024
            # データが規定以上の場合にはアクセスを遮断
            if kilobytes_length > SOCKET_REXEIVE_DATA_KB_LIMIT:
                check_result = False
            return check_result
        except Exception as e:
            print(e)
            return False

    async def _check_bytes_data_length(self, bytes_data):
        try:
            check_result = True
            # バイトデータの長さをそのまま取得し、KBに変換
            kilobytes_length = len(bytes_data) / 1024
            # データが規定以上の場合にはアクセスを遮断
            if kilobytes_length > SOCKET_REXEIVE_DATA_KB_LIMIT:
                check_result = False
            return check_result
        except Exception as e:
            print(e)
            return False

    # ------------------------------
    # connect
    async def _handle_connect(self,
                              room_id:str,
                              channel_name:str,
                              connect_user,):
        await asyncio.sleep(0.5)  # 非同期の待機処理
        try:
            status_code, return_data, return_user_data = await self._create_socket_access(room_id, channel_name, connect_user)
        except Exception as e:
            print(e)
            status_code      = 500
            return_data      = None
            return_user_data = None
        
        # ユーザ自身の return_user_data はユーザにのみ通知
        message_data = {
            'cmd':     'SetUserAccessId',
            'status':  status_code,
            'ok':      True if status_code == 200 else False,
            'message': None,
            'data':    return_user_data,
        }
        if status_code == 200:
            await self._self_send_message(message_data, is_send_bytes_data=False)

        # group_send_message
        message_data = {
            'cmd':     'SocketConnect',
            'status':  status_code,
            'ok':      True if status_code == 200 else False,
            'message': None,
            'data':    return_data,
        }
        if status_code == 200:
            await self._group_send_message(message_data, is_send_bytes_data=False)
        return None

    @database_sync_to_async
    def _create_socket_access(self,
                              room_id:str,
                              channel_name:str,
                              connect_user,):
        try:
            room_obj = Room.objects.get(room_id=room_id)
            # Create SocketAccess
            access_id = generate_uuid_hex()
            user_name = '*'+access_id[:5].upper()
            _ = SocketAccess.objects.create(room_id          = room_obj,
                                            access_id         = access_id,
                                            user              = None if connect_user.is_anonymous else connect_user,
                                            user_name         = user_name,
                                            channel_name      = channel_name,
                                            date_last_request = timezone.now(),
                                            date_access       = timezone.now(),)
            # GET SocketAccess data
            socket_access_objs = SocketAccess.objects.filter(room_id = room_obj).order_by('pk')\
                                                     .values('access_id', 'user_name')
            return_data = {
                'socket_access_objs': list(socket_access_objs),
            }
            return_user_data = {
                'access_id': access_id,
                'user_name': user_name,
            }
            return 200, return_data, return_user_data
        except Exception as e:
            print(e)
            return 500, None, None

    # ------------------------------
    # disconnect
    async def _handle_disconnect(self, room_id:str, channel_name:str):
        await asyncio.sleep(1)  # 非同期の待機処理
        try:
            status_code, return_data = await self._delete_socket_access(room_id, channel_name)
        except Exception as e:
            print(e)
            status_code = 500
            return_data = None

        # group_send_message
        message_data = {
            'cmd':     'SocketDisconnect',
            'status':  status_code,
            'ok':      True if status_code == 200 else False,
            'message': None,
            'data':    return_data,
        }
        if status_code == 200:
            await self._group_send_message(message_data, is_send_bytes_data=False)
        return None

    @database_sync_to_async
    def _delete_socket_access(self, room_id:str, channel_name:str):
        try:
            # Derete SocketAccess
            try:
                socket_access_obj = SocketAccess.objects.get(channel_name = channel_name)
                socket_access_obj.delete()
            except Exception as e:
                # 既にレコードが削除済みなどもありえるので無視
                pass

            # GET SocketAccess data
            socket_access_objs = SocketAccess.objects.filter(room_id__room_id = room_id).order_by('pk')\
                                                     .values('access_id', 'user_name')
            return_data = {
                'socket_access_objs': list(socket_access_objs),
            }
            return 200, return_data
        except Exception as e:
            print(e)
            return 500, None

    # ------------------------------
    # receive
    async def _handle_receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                check_result = await self._check_text_data_byte(text_data)
            elif bytes_data:
                check_result = await self._check_bytes_data_length(bytes_data)
            else:
                check_result = False

            if check_result:
                # post データ取得▽
                # バイトデータで来たら圧縮モードで返せるとみなす
                is_possible_compress = False
                try:
                    if text_data:
                        data_json = json.loads(text_data) if text_data else None
                        # ping は何も返さない
                        if data_json['cmd'] == 'ping':
                            return
                        # Reconnect はユーザにのみ通知
                        elif data_json['cmd'] == 'Reconnect':
                            message_data = {
                                'cmd':     'Reconnect',
                                'status':  200,
                                'ok':      True,
                                'message': None,
                                'data':    None,
                            }
                            return await self._self_send_message(message_data, is_send_bytes_data=False)
                    elif bytes_data:
                        data_json = json.loads(brotli.decompress(bytes_data).decode('utf-8')) if bytes_data else None
                        is_possible_compress = True
                    else:
                        data_json = None
                except Exception as e:
                    print(e)
                    data_json = None
                # post データ取得△

                if data_json:                    
                    # 短期間のリクエストを遮断する
                    check_result = await self._request_count_and_check_socket_access(data_json['request_user_access_id'])

                    if check_result:
                        # -------------------------
                        # メイン処理(cmd分岐) ▽
                        if data_json['cmd'] == 'SendUserMessage':
                            await self._receive_user_message(data_json['data']['message'],
                                                             None,
                                                             is_possible_compress)
                        # ... 他のコマンドあればここで分岐処理させる
                        # メイン処理(cmd分岐) △
                        # -------------------------
                    else:
                        message_data = {
                            'cmd':     'wsClose',
                            'status':  200,
                            'ok':      True,
                            'message': None,
                            'data':    None,
                        }
                        await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)

                # データを受信したら送信者に何か返す
                message_data = {
                    'cmd':     'receiverMessage',
                    'status':  200,
                    'ok':      True,
                    'message': 'receiveFin',
                    'data':    None,
                }
                await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
            else:
                message_data = {
                    'cmd':     'wsClose',
                    'status':  200,
                    'ok':      True,
                    'message': None,
                    'data':    None,
                }
                await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
        except Exception as e:
            print(e)
            message_data = {
                'cmd':     'Error',
                'status':  500,
                'ok':      False,
                'message': 'server process Error',
                'data':    None,
            }
            await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
        return None

    ####################
    # _receive_user_message ▽
    ####################
    async def _receive_user_message(self, user_message:str, message_id:str, is_possible_compress:bool):

        try:
            # RoomSettings の取得
            data_dict = await get_room_settings(self.room_id)
            # model_name の変換 (model_name_int でこの後 llmの切り替えするので保持)
            model_name_int          = data_dict['model_name']
            data_dict['model_name'] = MODEL_NAME_CHOICES_DICT[model_name_int]
            # user_message の投入
            data_dict['user_message'] = user_message
            # message_id 設定
            if message_id:
                data_dict['message_id'] = message_id
            else:
                data_dict['message_id'] = generate_uuid_hex()

            # ルームに紐づくヒストリーメッセージ時の取得▽
            history_list, history_text = await get_history(self.room_id, data_dict['history_len'])
            data_dict['history_list'] = history_list
            data_dict['history_text'] = history_text
            # ルームに紐づくヒストリーメッセージ時の取得△

            # 入力のバリデーション▽
            ## 何も質問されてないときに返すテキスト▽
            if data_dict['user_message'].replace(' ','').replace('　','') == '':
                error_message = ''
                message_data  = {
                    'cmd':  'SendUserMessage',
                    'status': 200,
                    'ok':     True,
                    'data': {
                        'messageId':   data_dict['message_id'],
                        'llmResponse': error_message,
                    },
                }
                await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
            ## 何も質問されてないときに返すテキスト△
            ## メッセージのトークンが設定値を超えた場合の処理▽
            elif not is_tokens_less_than_settings(
                        sentence   = data_dict['user_message']+ \
                                    data_dict['system_sentence'] if data_dict['system_sentence'] else ''+ \
                                    data_dict['assistant_sentence'] if data_dict['assistant_sentence'] else ''+ \
                                    data_dict['history_text'] if data_dict['history_text'] else '',
                        max_tokens = int(SEND_MAX_TOKENS)):
                error_message = f'入力文字数が設定値を超えたみたいです。\n過去の会話、システムメッセージなども含めて最大トークンは{SEND_MAX_TOKENS}に設定されています。'
                message_data = {
                    'cmd':  'SendUserMessage',
                    'status': 200,
                    'ok':     True,
                    'data': {
                        'messageId':   data_dict['message_id'],
                        'llmResponse': error_message,
                    },
                }
                await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
            ## メッセージのトークンが設定値を超えた場合の処理△
            # 入力のバリデーション△

            # メイン処理
            else:
                # プロンプトの作成
                formatted_prompt = await self._create_prompt(data_dict['user_message'])

                # メッセージの作成
                messages = create_messages(formatted_prompt,
                                        data_dict['system_sentence'],
                                        data_dict['assistant_sentence'],
                                        data_dict['history_list'])
                # llm
                # model_name_int の大きさで切り替え
                if model_name_int < 100:
                    llm = OpenAILlm(api_key           = settings.OPENAI_API_KEY,
                                    model_name        = data_dict['model_name'],
                                    temperature       = data_dict['temperature'],
                                    max_tokens        = data_dict['max_tokens'],
                                    top_p             = data_dict['top_p'],
                                    frequency_penalty = data_dict['frequency_penalty'],
                                    presence_penalty  = data_dict['presence_penalty'],)
                elif 100 <= model_name_int:
                    llm = GcloudLlm(project_name      = settings.GCLOUD_PROJECT_NAME,
                                    location_name     = settings.GCLOUD_LOCATION_NAME,
                                    model_name        = data_dict['model_name'],
                                    temperature       = data_dict['temperature'],
                                    max_tokens        = data_dict['max_tokens'],
                                    top_p             = data_dict['top_p'],
                                    frequency_penalty = data_dict['frequency_penalty'],
                                    presence_penalty  = data_dict['presence_penalty'],)
                llm_response = await llm.async_get_response(messages)
                message_data = {
                    'cmd':  'SendUserMessage',
                    'status': 200,
                    'ok':     True,
                    'data': {
                        'messageId':   data_dict['message_id'],
                        'llmResponse': llm_response,
                    },
                }
                await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)

                # 結果の処理
                data_dict['llm_response'] = llm_response
                tokens_info_dict = {
                    'sent_tokens': calc_token(sentence = data_dict['user_message']+ \
                                                        data_dict['system_sentence'] if data_dict['system_sentence'] else ''+ \
                                                        data_dict['assistant_sentence'] if data_dict['assistant_sentence'] else ''+ \
                                                        data_dict['history_text'] if data_dict['history_text'] else '',
                                            model_name = data_dict['model_name']),
                    'generated_tokens': calc_token(sentence = data_dict['llm_response'],),
                }
                data_dict['tokens_info_dict'] = tokens_info_dict
                
                # メッセージの保存
                await sync_save_message_models(self.room_id, data_dict)

                # ルーム名チェック
                is_replace, room_name = await replace_room_name_check(self.room_id, data_dict['user_message'])
                if is_replace:
                    message_data = {
                        'cmd':  'ChangeRoomName',
                        'status': 200,
                        'ok':     True,
                        'data': {
                            'roomName': room_name,
                        },
                    }
                    await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
        except Exception as e:
            print(e)
            message_data = {
                'cmd':     'Error',
                'status':  500,
                'ok':      False,
                'message': 'server process Error',
                'data':    None,
            }
            await self._self_send_message(message_data, is_send_bytes_data=is_possible_compress)
        return None
    ####################
    # _receive_user_message △
    ####################

    ####################
    # _create_prompt
    ####################
    async def _create_prompt(self, user_message:str):
        try:
            formatted_prompt = base_prompt.format(userMessage=user_message)
        except Exception as e:
            print(e)
            formatted_prompt = None
        return formatted_prompt

    ####################
    # _socket_access_get_channel_name
    # - access_id から channel_name を特定して _target_channel_name_send_message でメッセージを送信
    ####################
    @database_sync_to_async
    def _socket_access_get_channel_name(self, stage_id:str, access_id:str):
        try:
            channel_name = SocketAccess.objects.get(stage_id__stage_id = stage_id,
                                                    access_id          = access_id)\
                                                .channel_name
            return 200, channel_name
        except Exception as e:
            print(e)
            return 500, None

    ####################
    # _self_send_message
    ####################
    async def _self_send_message(self,
                                 message_data,
                                 is_send_bytes_data = True,):
        await self.channel_layer.send(
            self.channel_name,
            {
                'type':    'send_bytes_data_message' if is_send_bytes_data else 'send_text_data_message',
                'message': message_data,
            },
        )
        return None

    ####################
    # _group_send_message
    ####################
    async def _group_send_message(self,
                                  message_data,
                                  is_send_bytes_data = True,):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type':    'send_bytes_data_message' if is_send_bytes_data else 'send_text_data_message',
                'message': message_data,
            },
        )
        return None

    ####################
    # _target_channel_name_send_message
    ####################
    async def _target_channel_name_send_message(self,
                                                channel_name,
                                                message_data,
                                                is_send_bytes_data = True,):
        if channel_name:
            await self.channel_layer.send(
                channel_name,
                {
                    'type':    'send_bytes_data_message' if is_send_bytes_data else 'send_text_data_message',
                    'message': message_data,
                },
            )
        return None

    ####################
    # send_message
    ####################
    async def send_text_data_message(self, event):
        try:
            message = event['message']
            await self.send(text_data=json.dumps(message))
        except Exception as e:
            print(e)
            pass
        return None

    async def send_bytes_data_message(self, event):
        try:
            message = event['message']
            await self.send(bytes_data=brotli.compress(json.dumps(message).encode('utf-8'),
                                                       quality=4))
        except Exception as e:
            print(e)
            pass
        return None