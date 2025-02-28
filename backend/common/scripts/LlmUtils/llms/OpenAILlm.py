from rest_framework.exceptions import ValidationError
import openai
import asyncio
from typing import Dict, Tuple, Union, AsyncGenerator

class OpenAILlm:

    def __init__(self,
                 model_name:str = 'gpt-3.5-turbo',
                 api_key:str    = None,
                 *,
                 temperature:float       = 1.2,
                 max_tokens:int          = 128,
                 top_p:float             = 1.0,
                 frequency_penalty:float = 0.0,
                 presence_penalty:float  = 0.0,):

        # Verify the input is valid.
        if not api_key:
            raise ValidationError({'api_key': 'Please set api_key.'})
        # 想定外のパラメータが設定された場合の処理▽
        if not (0.0 <= temperature <= 2.0) or not (0.0 <= top_p <= 1.0) or not (-2.0 <= presence_penalty <= 2.0) or not (-2.0 <= frequency_penalty <= 2.0):
            raise ValueError('llm parameter values error')
        # 想定外のパラメータが設定された場合の処理△

        self.client = openai.OpenAI(api_key     = api_key,
                                    http_client = None,) # IF USE ProxyServer: httpx.Client(proxies=settings.HTTP_PROXY)
        
        self.model_name        = model_name
        self.temperature       = temperature
        self.max_tokens        = max_tokens
        self.top_p             = top_p
        self.frequency_penalty = frequency_penalty
        self.presence_penalty  = presence_penalty
        
    def get_response(self,
                     messages:list = [],
                     *,
                     is_return_usage_dict:bool = False,
                     timeout:int               = 60,
                     ) -> Union[None, str, Tuple[str, Dict[str, int]]]:

        if not messages or messages == []:
            return None

        response = self.client.chat.completions.create(
                        model             = self.model_name,
                        messages          = messages,
                        temperature       = self.temperature,
                        max_tokens        = self.max_tokens,
                        top_p             = self.top_p,
                        frequency_penalty = self.frequency_penalty,
                        presence_penalty  = self.presence_penalty,
                        stream            = False,
                        timeout           = timeout,)

        return_responce = response.choices[0].message.content

        if is_return_usage_dict:
            usage_dict = {
                'prompt_tokens':     response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens':      response.usage.total_tokens,
            }
            return return_responce, usage_dict

        return return_responce

    async def async_get_response(self,
                                 messages:list = [],
                                 *,
                                 is_return_usage_dict:bool = False,
                                 timeout:int               = 60,
                                 ) -> Union[None, str, Tuple[str, Dict[str, int]]]:

        if not messages or messages == []:
            return None

        def sync_call():
            return self.client.chat.completions.create(
                        model             = self.model_name,
                        messages          = messages,
                        temperature       = self.temperature,
                        max_tokens        = self.max_tokens,
                        top_p             = self.top_p,
                        frequency_penalty = self.frequency_penalty,
                        presence_penalty  = self.presence_penalty,
                        stream            = False,
                        timeout           = timeout,)

        response        = await asyncio.to_thread(sync_call)
        return_responce = response.choices[0].message.content

        if is_return_usage_dict:
            usage_dict = {
                'prompt_tokens':     response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens':      response.usage.total_tokens,
            }
            return return_responce, usage_dict

        return return_responce

    async def async_get_stream_response(self,
                                 messages:list = [],
                                 *,
                                 asyncio_sleep:float = 0.01,
                                 timeout:int         = 60,
                                 ) -> AsyncGenerator[str, None]:

        if not messages or messages == []:
            return

        def sync_call():
            return self.client.chat.completions.create(
                        model             = self.model_name,
                        messages          = messages,
                        temperature       = self.temperature,
                        max_tokens        = self.max_tokens,
                        top_p             = self.top_p,
                        frequency_penalty = self.frequency_penalty,
                        presence_penalty  = self.presence_penalty,
                        stream            = True,
                        timeout           = timeout,)

        response = await asyncio.to_thread(sync_call)

        for res in response:
            try:
                content = res.choices[0].delta.content
                if content == None:
                    content = ''
            except:
                content = ''
            yield content
            await asyncio.sleep(asyncio_sleep)