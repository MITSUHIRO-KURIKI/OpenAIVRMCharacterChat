import tiktoken
from typing import Dict

def calc_token(sentence:str   = '',
               model_name:str = None,
               ) -> int:
    """
    現状 tiktoken (OpenAI) だけ対応
    """
    num_tokens = 0
    try:
        if model_name:
            encoding      = tiktoken.encoding_for_model(model_name)
            encoding_name = encoding.name
        else:
            encoding_name = 'cl100k_base'
        num_tokens = len(tiktoken.get_encoding(encoding_name).encode(sentence))
    except Exception as e:
        print(e)

    return num_tokens

def is_tokens_less_than_settings(sentence:str   = '',
                                 model_name:str = None,
                                 max_tokens:int = 0,) -> bool:
    if max_tokens == 0:
        return True
    else:
        if calc_token(sentence, model_name) > max_tokens:
            return False
        else:
            return True