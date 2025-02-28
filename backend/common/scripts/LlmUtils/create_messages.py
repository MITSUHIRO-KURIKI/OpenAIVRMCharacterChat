from rest_framework.exceptions import ValidationError
import copy
from typing import List, Dict, Tuple, Optional

def create_messages(formatted_prompt:str,
                    system_sentence:Optional[str]               = None,
                    assistant_sentence:Optional[str]            = None,
                    history_list:Optional[List[Dict[str, str]]] = None,
                    ) -> List[Dict[str, str]]:

    if not formatted_prompt:
        raise ValidationError({'formatted_prompt': 'Please set formatted_prompt.'})
    try:
        if history_list:
            messages = copy.deepcopy(history_list)
            if system_sentence:
                messages.append({
                    'role':    'system',
                    'content': system_sentence,
                })
            if assistant_sentence:
                messages.append({
                    'role':    'assistant',
                    'content': assistant_sentence,
                })
            messages.append({
                'role':    'user',
                'content': formatted_prompt,
            })
        else:
            messages = []
            if system_sentence:
                messages.append({
                    'role':    'system',
                    'content': system_sentence,
                })
            if assistant_sentence:
                history_list.append({
                    'role':    'assistant',
                    'content': assistant_sentence,
                })
            messages.append({
                'role':    'user',
                'content': formatted_prompt,
            })
    except Exception as e:
        messages = []
        print(e)
    return messages

# https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference?hl=ja#request
def convert_messages_for_gemini(messages: List[Dict[str, str]]
                                ) -> Tuple[List[Dict[str, List[Dict[str, str]]]],
                                           List[Dict[str, List[Dict[str, str]]]],]:
    """
    OpenAI 互換の messages を、Gemini 向けの contents / system_instruction に変換する。

    :param messages: role と contents を含む OpenAI互換フォーマットのリスト
    :return: 
        - system_instruction: [{'role': 'system', 'parts': [{'text': ...}]}]
        - contents:           [{'role': 'user'|'model', 'parts': [{'text': ...}]}]
    """
    try:
        if not messages:
            return [], []
        # 最後に登場する system を抜き取る (他の system_sentence 破棄)
        system_index = None
        for idx in reversed(range(len(messages))):
            if messages[idx].get('role') == 'system':
                system_index = idx
                break
        system_instruction = []
        if system_index is not None:
            system_data = messages.pop(system_index)
            system_text = system_data.get('content', '')
            system_instruction.append({
                'role': 'system',
                'parts': [{'text': system_text}]
            })
            # system 削除
            messages = [m for m in messages if m.get('role') != 'system']

        # contents 作成
        contents = []
        for m in messages:
            role = m.get('role')
            text = m.get('content', '')
            if role == 'assistant':
                contents.append({
                    'role': 'model',
                    'parts': [{'text': text}]
                })
            elif role == 'user':
                contents.append({
                    'role': 'user',
                    'parts': [{'text': text}]
                })
            else:
                pass
    except Exception as e:
        messages = []
        print(e)
    return system_instruction, contents