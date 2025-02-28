/**
 * === Django consumer.py で以下を返す点に注意 ===
 * export type ServerMessage = {
 *   cmd:      string;
 *   status:   number;
 *   ok:       boolean;
 *   message?: string | null;
 *   data?: {
 *     [key: string]: unknown;
 *   };
 * };
 */
'use client';

// react
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
// features
import { sanitizeDOMPurify } from '@/features/utils';
import type { WebSocketCoreContextValue, ServerMessage } from '@/app/providers';
// components
import { showToast } from '@/app/components/utils';


// type
type CustomReceiveLogicProps = {
  contextValue:         WebSocketCoreContextValue;
  payload:              ServerMessage;
  setReceivedMessages:  Dispatch<SetStateAction<string>>;
  setRecognizedText:    Dispatch<SetStateAction<string[]>>;
  allrecognizedTextRef: MutableRefObject<string[]>;
  textToSpeech:         (text: string) => Promise<void>;
  setSidebarInsetTitle: Dispatch<SetStateAction<string>> | undefined;
};

// customReceiveLogic ▽
export async function customReceiveLogic({
  contextValue,
  payload,
  setReceivedMessages,
  setRecognizedText,
  allrecognizedTextRef,
  textToSpeech,
  setSidebarInsetTitle,}: CustomReceiveLogicProps): Promise<void> {

  const { setIsWebSocketWaiting }  = contextValue;
  const { cmd, ok, message, data } = payload;

  try {
    // SendUserMessage
    if (cmd === 'SendUserMessage') {
      if (ok) {
        const messageText = sanitizeDOMPurify(String(data?.llmResponse || ''));
        
        setRecognizedText([]);
        setReceivedMessages(messageText);
        textToSpeech(messageText);
        allrecognizedTextRef.current = [];
      } else {
        showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
      };
    // ChangeRoomName
    } else if (cmd === 'ChangeRoomName') {
      if (ok) {
        const roomName = sanitizeDOMPurify(String(data?.roomName || ''));
        if (setSidebarInsetTitle) setSidebarInsetTitle(roomName);
      } else {
        //
      };
    // 共通コマンド ▽
    // Reconnect
    } else if (cmd === 'Reconnect') {
      // 特になにもしない
    // Error
    } else if (cmd === 'Error') {
      if (message) {
        showToast('error', sanitizeDOMPurify(String(message)), {position: 'bottom-right', duration: 3000});
      };
      // 多重送信管理フラグを解除
      setIsWebSocketWaiting(false);
    // 共通コマンド △
    // end
    };
  } catch {
    showToast('error', 'receive error', {position: 'bottom-right', duration: 3000});
  } finally {
    // 多重送信管理フラグを解除
    setIsWebSocketWaiting(false);
  };
};
// customReceiveLogic △