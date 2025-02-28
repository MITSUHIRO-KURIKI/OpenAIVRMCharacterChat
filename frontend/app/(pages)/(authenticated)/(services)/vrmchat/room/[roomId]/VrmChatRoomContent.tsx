'use client';

// react
import { type ReactElement } from 'react';
// providers
import {
  WebSocketCoreProvider,
  SpeechTextAzureCoreProvider as SpeechTextCoreProvider, // or SpeechTextGcloudCoreProvider
  VrmCoreProvider,
} from '@/app/providers';
// features
import { vrmChatPath } from '@/features/paths/backend';
// import
import { VrmChatRoomParams } from './page';
// include
import { ClientContext } from './ClientContext';


// VrmChatRoomContent
export function VrmChatRoomContent({ roomId, roomTitle }: VrmChatRoomParams): ReactElement{

  const language = navigator.language;
  let recognitionLanguage = '';
  let speechVoiceName     = '';
  console.log('language:',language)
  if (language === 'ja') {
    recognitionLanguage = 'ja-JP';
    speechVoiceName     = 'ja-JP-AoiNeural';
  } else {
    recognitionLanguage = 'en-US';
    speechVoiceName     = 'en-US-PhoebeMultilingualNeural';
  };

  return (
    <>
      <WebSocketCoreProvider WebsocketUrl={vrmChatPath.ws_room} WebsocketId={roomId}>
        <SpeechTextCoreProvider recognitionLanguage = {recognitionLanguage}
                                speechVoiceName     = {speechVoiceName}>
          <VrmCoreProvider url = {'/services/vrmchat/vrm/model.vrm'}>
            <ClientContext roomId    = {roomId}
                           roomTitle = {roomTitle}/>
          </VrmCoreProvider>
        </SpeechTextCoreProvider>
      </WebSocketCoreProvider>
    </>
  );
};