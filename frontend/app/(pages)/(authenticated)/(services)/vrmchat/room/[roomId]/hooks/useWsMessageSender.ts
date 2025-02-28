'use client';

// react
import {
  useEffect,
  type Dispatch,
  type SetStateAction,
  type MutableRefObject,
} from 'react';
// providers
import { WebSocketCoreContextValue } from '@/app/providers';


// type
type UseWsMessageSenderProps = {
  isStopRecognition:    boolean;
  allrecognizedTextRef: MutableRefObject<string[]>;
  handleSendCore:       WebSocketCoreContextValue['handleSendCore'];
  setReceivedMessages:  Dispatch<SetStateAction<string>>;
};

// useWsMessageSender
// - WebSocket 送信ロジック専用のカスタムフック
// - isStopRecognition 変化で発火
export function useWsMessageSender({
  isStopRecognition,
  allrecognizedTextRef,
  handleSendCore,
  setReceivedMessages, }: UseWsMessageSenderProps) {

  useEffect(() => {
    if (!isStopRecognition) return;

    // 受信メッセージの初期化
    setReceivedMessages('');

    // WebSocket 送信
    const combinedMessage = allrecognizedTextRef.current.join('');
    // WebSocket 送信
    handleSendCore({
      cmd:  'SendUserMessage',
      data: {
        message: combinedMessage,
      },
    });
  }, [isStopRecognition]);
};