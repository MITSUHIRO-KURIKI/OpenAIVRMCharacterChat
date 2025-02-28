# https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference?hl=ja#python_1
from rest_framework.exceptions import ValidationError
from google import genai
from google.genai import types
import asyncio
from typing import Dict, Tuple, Union, AsyncGenerator
from ..create_messages import convert_messages_for_gemini

class GcloudLlm:

    def __init__(self,
                 model_name:str    = 'gemini-1.5-flash',
                 project_name:str  = None,
                 location_name:str = None,
                 *,
                 temperature:float       = 1.2,
                 max_tokens:int          = 128,
                 top_p:float             = 1.0,
                 frequency_penalty:float = 0.0,
                 presence_penalty:float  = 0.0,):

        # Verify the input is valid.
        if not project_name:
            raise ValidationError({'project_name': 'Please set project_name.'})
        if not location_name:
            raise ValidationError({'location_name': 'Please set location_name.'})
        # 想定外のパラメータが設定された場合の処理▽
        if not (0.0 <= temperature <= 2.0) or not (0.0 <= top_p <= 1.0) or not (-2.0 <= presence_penalty <= 2.0) or not (-2.0 <= frequency_penalty <= 2.0):
            raise ValueError('llm parameter values error')
        # 想定外のパラメータが設定された場合の処理△

        self.client = genai.Client(vertexai = True,
                                   project  = project_name,
                                   location = location_name,)
        
        self.model_name        = model_name
        self.generate_content_config = types.GenerateContentConfig(
            temperature         = temperature,
            max_output_tokens   = max_tokens,
            top_p               = top_p,
            frequency_penalty   = frequency_penalty,
            presence_penalty    = presence_penalty,
            response_modalities = ['TEXT'],
            safety_settings = [
                types.SafetySetting(category='HARM_CATEGORY_HATE_SPEECH',       threshold='OFF'),
                types.SafetySetting(category='HARM_CATEGORY_DANGEROUS_CONTENT', threshold='OFF'),
                types.SafetySetting(category='HARM_CATEGORY_HARASSMENT',        threshold='OFF'),
                types.SafetySetting(category='HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold='OFF'),
            ],
        )

    def get_response(self,
                     messages:list = [],
                     *,
                     is_return_usage_dict:bool = False,
                     timeout:int               = 60,
                     ) -> Union[None, str, Tuple[str, Dict[str, int]]]:

        if not messages or messages == []:
            return None

        system_instruction, contents = convert_messages_for_gemini(messages)

        response = self.client.models.generate_content(
                        model              = self.model_name,
                        contents           = contents,
                        # system_instruction = system_instruction if system_instruction else None,
                        config             = self.generate_content_config,)
        
        return_responce = response.candidates[0].content.parts[0].text

        if is_return_usage_dict:
            usage_dict = {
                'prompt_tokens':     response.usage_metadata.prompt_token_count,
                'completion_tokens': response.usage_metadata.candidates_token_count,
                'total_tokens':      response.usage_metadata.total_token_count,
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
        
        system_instruction, contents = convert_messages_for_gemini(messages)

        def sync_call():
            return self.client.models.generate_content(
                        model              = self.model_name,
                        contents           = contents,
                        # system_instruction = system_instruction if system_instruction else None,
                        config             = self.generate_content_config,)

        response        = await asyncio.to_thread(sync_call)
        return_responce = response.candidates[0].content.parts[0].text

        if is_return_usage_dict:
            usage_dict = {
                'prompt_tokens':     response.usage_metadata.prompt_token_count,
                'completion_tokens': response.usage_metadata.candidates_token_count,
                'total_tokens':      response.usage_metadata.total_token_count,
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

        system_instruction, contents = convert_messages_for_gemini(messages)

        def sync_call():
            return self.client.models.generate_content_stream(
                        model              = self.model_name,
                        contents           = contents,
                        # system_instruction = system_instruction if system_instruction else None,
                        config             = self.generate_content_config,)

        response = await asyncio.to_thread(sync_call)

        for res in response:
            try:
                content = res.text
                if content == None:
                    content = ''
            except:
                content = ''
            yield content
            await asyncio.sleep(asyncio_sleep)