'use client';

// react
import { useEffect, type Dispatch, type SetStateAction } from 'react';
// providers
import {
  WebSocketCoreContextValue,
  ServerMessage,
  type SpeechTextCoreContextValue,
} from '@/app/providers';
// include
import { customReceiveLogic } from './customReceiveLogic';


// type
type UseWsMessageReceiverProps = {
  wsContext:             WebSocketCoreContextValue | null;
  serverMessage:         ServerMessage | null;
  setReceivedMessages:   Dispatch<SetStateAction<string>>;
  setRecognizedText:     SpeechTextCoreContextValue['setRecognizedText'];
  allrecognizedTextRef:  SpeechTextCoreContextValue['allrecognizedTextRef'];
  textToSpeech:          SpeechTextCoreContextValue['textToSpeech'];
  setSidebarInsetTitle?: Dispatch<SetStateAction<string>> | undefined;
};

// useWsMessageReceiver
// - WebSocket 受信ロジック専用のカスタムフック
export function useWsMessageReceiver({
  wsContext,
  serverMessage,
  setReceivedMessages,
  setRecognizedText,
  allrecognizedTextRef,
  textToSpeech,
  setSidebarInsetTitle, }: UseWsMessageReceiverProps) {

  useEffect(() => {
    if (!wsContext || !serverMessage) return;

    const { cmd, status, ok, message, data } = serverMessage;
    void customReceiveLogic({
      contextValue: wsContext,
      payload: { cmd, status, ok, message, data },
      setReceivedMessages,
      setRecognizedText,
      allrecognizedTextRef,
      textToSpeech,
      setSidebarInsetTitle,
    });
  }, [ serverMessage ]);
};