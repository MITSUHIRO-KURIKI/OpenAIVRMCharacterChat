'use client';

// react
import {
  useState,
  useEffect,
  useContext,
  type ReactElement,
} from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// providers
import {
  // WebSocket
  WebSocketCoreContext,
  type WebSocketCoreContextValue,
  // SpeechText
  SpeechTextAzureCoreContext as SpeechTextCoreContext, // or SpeechTextGcloudCoreContext
  type SpeechTextCoreContextValue,
  // Vrm
  VrmCoreContext,
  useVrmLipSync,
  type VrmCoreContextValue,
} from '@/app/providers';
import {
  SidebarContext,
  type SidebarContextValue,
} from '@/app/components/ui/Navigation';
// hooks
import { useWsMessageSender, useWsMessageReceiver } from './hooks';
// features
import { UrlToString } from '@/features/utils';
// components
import { OverlaySpinner, showToast } from '@/app/components/utils';
// import
import { VrmChatRoomParams } from './page';
// include
import { ClientUI } from './ui/ClientUI';


// type
export type ClientUIProps = {
  receivedMessages: string;
} & Pick<VrmChatRoomParams,          'roomId'>
  & Pick<WebSocketCoreContextValue,  'isWebSocketWaiting'>
  & Pick<SpeechTextCoreContextValue, 'recognizingText' | 'recognizedText' | 'isLoading' | 'isStopRecognition' | 'isRecognizing' | 'toggleRecognition'>
  & Pick<VrmCoreContextValue,        'width' | 'height' | 'containerRef'>;

// ClientContext ▽
export function ClientContext({ roomId, roomTitle }: VrmChatRoomParams): ReactElement {
  // WebSocketCoreContext first ▽
  const wsContext = useContext(WebSocketCoreContext);
  const {
    socketRef,
    isWebSocketWaiting,
    handleSendCore,
    serverMessage,
  } = wsContext as WebSocketCoreContextValue;
  // WebSocketCoreContext first △
  // SpeechTextCoreContext first ▽
  const stContext = useContext(SpeechTextCoreContext);
  const {
    recognizingText,
    recognizedText,
    setRecognizedText,
    allrecognizedTextRef,
    isSpeechStreaming,
    speechDataArray,
    speechAnalyser,
    isLoading,
    isRecognizing,
    isStopRecognition,
    toggleRecognition,
    textToSpeech,
  } = stContext as SpeechTextCoreContextValue;
  // SpeechTextCoreContext first △
  // VrmCoreContext first ▽
  const vrmContext = useContext(VrmCoreContext);
  const {
    vrmRef,
    width,
    height,
    containerRef,
  } = vrmContext as VrmCoreContextValue;
  // VrmCoreContext first △
  // SidebarContext first ▽
  const sbarContext = useContext(SidebarContext);
  const {
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
    setSidebarInsetSubTitleUrl,
  } = sbarContext as SidebarContextValue || {};
  // SidebarContext first △
  
  // Local State
  const [receivedMessages, setReceivedMessages] = useState<string>('');

  // WebSocket 送信
  useWsMessageSender({
    isStopRecognition,
    allrecognizedTextRef,
    handleSendCore,
    setReceivedMessages,
  });
  // WebSocket 受信
  useWsMessageReceiver({
    wsContext,
    serverMessage,
    setReceivedMessages,
    setRecognizedText,
    allrecognizedTextRef,
    textToSpeech,
    setSidebarInsetTitle,
  });
  // VRM リップシンク
  useVrmLipSync({
    isSpeechStreaming: isSpeechStreaming,
    vrm:               vrmRef.current,
    speechAnalyser:    speechAnalyser,
    speechDataArray:   speechDataArray,
  });

  // Sidebar タイトルセット ▽
  useEffect(() => {
    if (setSidebarInsetTitle)       setSidebarInsetTitle(roomTitle);
    if (setSidebarInsetSubTitle)    setSidebarInsetSubTitle('VRM Chat');
    if (setSidebarInsetSubTitleUrl) setSidebarInsetSubTitleUrl(UrlToString(pagesPath.servicesPath.vrmChat.$url()));
  }, [
    roomTitle,
    setSidebarInsetTitle,
    setSidebarInsetSubTitle,
    setSidebarInsetSubTitleUrl,
  ]);
  // Sidebar タイトルセット △

  // WebSocketCoreContext VrmCoreContext SidebarContext last ▽
  if (!wsContext || !vrmContext || !stContext ) {
    showToast('error', 'error', { position: 'bottom-right', duration: 3000 });
    return <p className='select-none text-xs font-thin text-muted-foreground'>Sorry, not available</p>;
  };
  // WebSocketCoreContext VrmCoreContext SidebarContext last △

  return (
    <>
      <OverlaySpinner isActivate={!(socketRef.current?.readyState === WebSocket.OPEN)} />
      <ClientUI
        roomId             = {roomId}
        isWebSocketWaiting = {isWebSocketWaiting}
        recognizedText     = {recognizedText}
        recognizingText    = {recognizingText}
        receivedMessages   = {receivedMessages}
        isLoading          = {isLoading}
        isRecognizing      = {isRecognizing}
        isStopRecognition  = {isStopRecognition}
        toggleRecognition  = {toggleRecognition}
        width              = {width}
        height             = {height}
        containerRef       = {containerRef} />
    </>
  );
};
// ClientContext △