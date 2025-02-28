"""
WebSocket で Gcloud の Speech-to-Text と Text-to-Speech を扱う
    - bytes_data => STT処理 (Speech-to-Text: セッション管理)
    - text_data  => JSONに "cmd: tts" があれば TTS処理 (Text-to-Speech)
"""
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from base64 import b64encode
import brotli
import json
from api.utils import jwt_auth_get_id
from apps.utils import sync_get_user_obj
from google.cloud.speech_v1 import (
    SpeechAsyncClient, RecognitionConfig,
    StreamingRecognitionConfig, StreamingRecognizeRequest,
)
from google.cloud.texttospeech import (
    TextToSpeechClient, SynthesisInput, VoiceSelectionParams,
    SsmlVoiceGender, AudioConfig, AudioEncoding,
)


class ThirdPartyGcloudSttTtsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # ユーザの取得と初期化 ▽
        user_id = jwt_auth_get_id(self.scope['cookies'])
        if user_id:
            self.connect_user = await sync_get_user_obj(user_id)
        else:
            self.connect_user = None
        # ユーザの取得と初期化 △

        # アクセス制御 ▽
        ## ユーザが存在しない場合は接続を拒否
        if not self.connect_user:
            await self.close()
            raise StopConsumer()
        # アクセス制御 △

        await self.accept()

        # クライアント
        self.stt_client = SpeechAsyncClient()
        self.tts_client = TextToSpeechClient()

        # STT セッション管理
        # セッションIDをキーにし、 { "queue": ..., "task": ..., "sttend_flag": ..., "running": ... } を持つ
        self.stt_sessions    = {}
        self.session_counter = 0  # 連番付与

    async def disconnect(self, close_code):
        # WebSocket切断時、すべてのセッションをキャンセル/クリーンアップ
        for session_id in list(self.stt_sessions.keys()):
            await self._cleanup_session(session_id)
        await self.close()
        raise StopConsumer()

    # ------------------------------
    # receive
    async def receive(self, text_data=None, bytes_data=None):
        """
        - bytes_data = 音声チャンク / b'sttend'
        - text_data  = JSON形式コマンド(TTS)
        """
        try:
            if bytes_data is not None:
                await self._handle_audio(bytes_data)
            elif text_data is not None:
                asyncio.create_task(self._handle_receive_text(text_data))
        except Exception as e:
            print(e)
            message_data = {
                'cmd':     'error',
                'status':  500,
                'ok':      False,
                'message': 'error',
                'data':    None,
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)

    async def _handle_receive_text(self, text_data: str):
        try:
            data_json = json.loads(text_data)
            if data_json['cmd'] == 'tts':
                await self._handle_tts(data_json['data']['text'])
            else:
                pass
        except Exception as e:
            print(e)
            message_data = {
                'cmd': 'error',
                'status': 500,
                'ok': False,
                'message': 'error',
                'data': None,
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)

    ####################
    # Speech-to-Text
    ####################
    async def _handle_audio(self, chunk: bytes):
        # 直前のセッションID(最大値)を探す
        current_session_id = self._get_latest_session_id()
        if chunk == b'sttend':
            # セッションを終了待ちにする (セッションがない場合は無視)
            if current_session_id is not None:
                self.stt_sessions[current_session_id]['sttend_flag'] = True
                await self.stt_sessions[current_session_id]['queue'].put(b'sttend')
            return
        # セッションがない or 既存セッションが終了待ちなら、新規セッションを開始
        if current_session_id is None:
            # セッションが一つもない場合
            session_id = await self._create_stt_session()
            await self.stt_sessions[session_id]['queue'].put(chunk)
        else:
            # セッションがまだ動作中かチェック
            if self.stt_sessions[current_session_id]['sttend_flag']:
                # セッションが終了待ち状態なので、新しくセッションを立ち上げる
                session_id = await self._create_stt_session()
                await self.stt_sessions[session_id]['queue'].put(chunk)
            else:
                # 継続中のセッション
                await self.stt_sessions[current_session_id]['queue'].put(chunk)

    async def _create_stt_session(self) -> int:
        """
        新しい STT セッションを作成し、タスクを起動して返す
        """
        session_id           = self.session_counter
        self.session_counter += 1
        queue                = asyncio.Queue()
        self.stt_sessions[session_id] = {
            'queue':       queue,
            'sttend_flag': False,   # b'sttend' を受け取ったか
            'running':     True,    # セッションが継続中か
            'task':        asyncio.create_task(self._run_streaming_recognize(session_id))
        }
        return session_id

    def _get_latest_session_id(self):
        if not self.stt_sessions:
            return None
        return max(self.stt_sessions.keys())

    async def _cleanup_session(self, session_id: int):
        session = self.stt_sessions.get(session_id)
        if not session:
            return
        session['running'] = False
        task               = session['task']
        if task and not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
        self.stt_sessions.pop(session_id, None)

    # メイン処理
    async def _run_streaming_recognize(self, session_id: int):
        config = RecognitionConfig(
            encoding                     = RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz            = 16000,
            language_code                = 'ja-JP',
            profanity_filter             = True,
            enable_automatic_punctuation = True,
        )
        streaming_config = StreamingRecognitionConfig(
            config          = config,
            interim_results = True,
        )
        async def _request_generator():
            # 最初の1回だけ config を送る (仕様)
            yield StreamingRecognizeRequest(streaming_config=streaming_config)
            while True:
                # セッションがまだ存在しているか確認
                session = self.stt_sessions.get(session_id)
                if not session or not session['running']:
                    break
                # chuk処理
                chunk = await session['queue'].get()
                if chunk == b'sttend':
                    # クライアントが認識終了の注入
                    # → watch-dog起動
                    asyncio.create_task(self._watchdog_no_final(session_id, timeout=1.0))
                    continue
                if chunk == 'closeTask' or chunk is None:
                    break
                yield StreamingRecognizeRequest(audio_content=chunk)

        try:
            requests       = _request_generator()
            response_aiter = await self.stt_client.streaming_recognize(requests)
            async for response in response_aiter:
                # すでにセッションが終了していないか確認
                session = self.stt_sessions.get(session_id)
                if not session or not session['running']:
                    break

                for result in response.results:
                    if not result.alternatives:
                        continue
                    transcript = result.alternatives[0].transcript
                    is_final   = result.is_final
                    is_end     = False
                    if is_final and session['sttend_flag']:
                        # sttend受け取り済みで is_final 出たら is_end
                        is_end = True

                    await self.send(text_data=json.dumps({
                        'transcript': transcript,
                        'is_final':   is_final,
                        'is_end':     is_end,
                    }))
                    if is_end:
                        # セッションを終了
                        await self._cleanup_session(session_id)
                        return

        except asyncio.CancelledError:
            await self._cleanup_session(session_id)
        except Exception as e:
            print(e)
            await self._cleanup_session(session_id)

    async def _watchdog_no_final(self, session_id: int, timeout=1.0):
        """
        timeout 以内に is_final が来なければ
        クライアントにそれを通知してセッションを終了する
        """
        await asyncio.sleep(timeout)
        session = self.stt_sessions.get(session_id)
        if session and session['sttend_flag'] and session['running']:
            await self.send(text_data=json.dumps({
                'transcript': '',
                'is_final': True,
                'is_end': True,
            }))
            await self._cleanup_session(session_id)

    ####################
    # Text-to-Speech
    ####################
    async def _handle_tts(self, text: str):
        try:
            # TextToSpeech のリクエスト定義
            # OGG_OPUS or MP3 などに設定可能
            input_text   = SynthesisInput(text=text)
            # サポート音声一覧
            # https://cloud.google.com/text-to-speech/docs/voices?hl=ja
            #  - print(self.tts_client.list_voices(language_code = 'ja-JP'))
            voice_params = VoiceSelectionParams(
                name          = 'ja-JP-Neural2-B',
                language_code = 'ja-JP',
                ssml_gender   = SsmlVoiceGender.SSML_VOICE_GENDER_UNSPECIFIED,
            )
            audio_config = AudioConfig(
                audio_encoding = AudioEncoding.OGG_OPUS,
                speaking_rate  = 1.0, # default: 1.0
                pitch          = 0.0, # default: 0.0
                volume_gain_db = 0.0, # default: 0.0
            )
            response = self.tts_client.synthesize_speech(
                request = {
                    'input':        input_text,
                    'voice':        voice_params,
                    'audio_config': audio_config,
                }
            )
            if not response.audio_content:
                message_data = {
                    'cmd':          'tts',
                    'ok':           False,
                    'status':       500,
                    'audioContent': None,
                    'message':      'No speech?',
                    'toastType':    'info',
                    'toastMessage': 'No speech?',
                }
                await self._self_send_message(message_data, is_send_bytes_data=False)
                return
            # バイナリ -> Base64
            base64_audio = b64encode(response.audio_content).decode('utf-8')
            message_data = {
                'cmd':         'tts',
                'ok':           True,
                'status':       200,
                'audioContent': base64_audio,
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)
        except Exception as e:
            print(e)
            message_data = {
                'cmd':          'error',
                'status':       500,
                'ok':           False,
                'message':      'error',
                'toastType':    'error',
                'toastMessage': 'error',
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)

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