from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from typing import Dict, List, Tuple, Optional
from common.scripts.LlmUtils import text_modify_fnc
from ..models import Room, RoomSettings, Message
from ..settings import DEFAULT_ROOM_NAME, MAX_LEN_ROOM_NAME

User = get_user_model()


@database_sync_to_async
def sync_get_room_obj(room_id: str):
    """
    非同期対応の Django ORM クエリを使用して、モデルオブジェクトを取得する。

    Args:
        room_id (str): プライマリキー。

    Returns:
        Optional[Room]: オブジェクト（存在する場合）、または None。
    """
    try:
        return Room.objects.get(room_id=room_id, is_active=True)
    except Room.DoesNotExist:
        return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def get_room_settings(room_id:str,
                      ) -> Dict[str, str]:
    try:
        room_settings_dict         = {}
        room_settings_model_object = RoomSettings.objects.get(room_id__room_id=room_id)

        room_settings_dict['system_sentence']    = room_settings_model_object.system_sentence
        room_settings_dict['assistant_sentence'] = room_settings_model_object.assistant_sentence
        room_settings_dict['history_len']        = room_settings_model_object.history_len
        room_settings_dict['model_name']         = room_settings_model_object.model_name
        room_settings_dict['max_tokens']         = room_settings_model_object.max_tokens
        room_settings_dict['temperature']        = room_settings_model_object.temperature
        room_settings_dict['top_p']              = room_settings_model_object.top_p
        room_settings_dict['presence_penalty']   = room_settings_model_object.presence_penalty
        room_settings_dict['frequency_penalty']  = room_settings_model_object.frequency_penalty
    except Exception as e:
        print(e)
        return None
    return room_settings_dict


@database_sync_to_async
def get_history(room_id:str,
                history_len:int = 3,
                ) -> Optional[Tuple[List[Dict[str, str]], str]]:
    history_message_list = []
    history_message_text = ''
    try:
        if history_len != 0:
            message_objs = Message.objects.filter(room_id__room_id = room_id,
                                                  is_active        = True,
                                                 ).order_by('-date_create')[:history_len] # 新しいものを取る (1/1, 1/2)
            if message_objs:
                for message_obj in reversed(message_objs):                        # 古いものから入れる [1/2, 1/1]
                    history_message_list.append({
                        'role':    'user',
                        'content': message_obj.user_message,
                    })
                    history_message_list.append({
                        'role':    'assistant',
                        'content': message_obj.llm_response,
                    })
                    history_message_text += message_obj.user_message+message_obj.llm_response
    except Exception as e:
        print(e)

    return history_message_list, history_message_text

@database_sync_to_async
def sync_save_message_models(room_id:str, data_dict:dict):
    try:
        user_settings = {
            k: v
            for k, v in data_dict.items()
            if (    k.lower() != 'message_id'
                and k.lower() != 'user_message'
                and k.lower() != 'llm_response'
                and k.lower() != 'tokens_info_dict'
                and k.lower() != 'history_list'
                and k.lower() != 'history_text'
            )
        }

        Message.objects.create(
                room_id          = Room.objects.get(room_id=room_id),
                message_id       = data_dict['message_id'],
                user_message     = data_dict['user_message'],
                llm_response     = text_modify_fnc(data_dict['llm_response']),
                user_settings    = user_settings,
                tokens_info_dict = data_dict['tokens_info_dict'],
                history_list     = data_dict['history_list'],)
    except Exception as e:
        print(e)

@database_sync_to_async
def replace_room_name_check(room_id:str,
                              user_sentence:str = DEFAULT_ROOM_NAME,
                              ) -> None:
    is_replace = False
    room_name  = None
    try:
        # room_name がデフォルトの場合には最初の質問を room_name に設定する
        room_settings_model_obj = RoomSettings.objects.get(room_id__room_id=room_id)
        if room_settings_model_obj.room_name == DEFAULT_ROOM_NAME:
            if len(user_sentence) > MAX_LEN_ROOM_NAME:
                room_name = user_sentence[:MAX_LEN_ROOM_NAME-4] + '...'
            else:
                room_name = user_sentence
            room_settings_model_obj.room_name = room_name
            room_settings_model_obj.save()
            is_replace = True
        # 違う場合にもナビゲーションから変更されているかもしれないのでルーム名返す
        else:
            room_name = room_settings_model_obj.room_name
            is_replace = True
    except:
        pass
    return is_replace, room_name