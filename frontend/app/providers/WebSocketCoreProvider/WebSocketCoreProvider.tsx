/**
 * [ Context 受け取り ]
 * const wsContext = useContext(WebSocketCoreContext);
 * const { isWebSocketWaiting, handleSendCore, serverMessage } = wsContext as WebSocketCoreContextValue;
 * const { cmd, status, ok, message, data }                    = (serverMessage ?? {}) as ServerMessage;
 * 
 * [ Serverからのメッセージ受け取り ]
 * -> serverMessageが変化したら実行される関数の中で独自レシーバー関数を準備
 * -> cmd に応じて処理を分岐できる
 * ex.
 * ``` child.tsx
 *   // 送信
 *   const [inputText, setInputText] = useState<string>('');
 *   const handleClickTestMessage = (e) => {
 *     e.preventDefault();
 *     e.stopPropagation();
 *     handleSendCore({cmd: 'helloCmd', data: { message: inputText }});
 *     setInputText('');
 *   };
 *   // 受信
 *   useEffect(() => {
 *     if (!wsContext || !serverMessage) return;
 *     customReceiveLogic(
 *       context, { cmd, status, ok, message, data },
 *       setReceivedMessages, //->ここに localのuseStateのセットを渡してレシーバーで表示するなど. 複数あれば複数渡してもOK
 *     );
 *   }, [serverMessage, cmd, status, ok, message, data]);
 * ```
 * 
 * ``` customReceiveLogic.ts
 * export async function customReceiveLogic(
 *   contextValue: WebSocketCoreContextValue,
 *   payload:      ServerMessage,
 *   setReceivedMessages,
 *   ): Promise<void> {
 *   const { setIsWebSocketWaiting } = contextValue;
 *   const { cmd, ok, data }         = payload;
 *   try {
 *     if (cmd === 'helloCmd') {
 *       if (ok) {
 *         const messageText = sanitizeDOMPurify(String(data?.message || ''));
 *         setReceivedMessages(messageText);
 *       } else {
 *         showToast('error', 'receive error');
 *       };
 *     ... 他に cmd 分岐あれば書く
 *     };
 *   } finally {
 *     setIsWebSocketWaiting(false); // 多重送信管理フラグ解除を忘れない
 *   };
 * };
 * ```
 */
'use client';

// react
import {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MutableRefObject,
} from 'react';
// features
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// lib
import brotliPromise from 'brotli-wasm';
// types
import type { ClientMessage, ServerMessage, BrotliWasm } from './type.d';

// type
type WebSocketCoreProviderProps = {
  WebsocketUrl: string;
  WebsocketId:  string;
  children:     ReactNode;
};
export type WebSocketCoreContextValue = {
  socketRef:                   MutableRefObject<WebSocket | null>;
  accessIdRef:                 MutableRefObject<string>;
  isWebSocketWaiting:          boolean;
  setIsWebSocketWaiting:       Dispatch<SetStateAction<boolean>>;
  handleSendCore:              ({cmd, data}: {cmd: string, data: Record<string, string>}) => void;
  handleSendSystemMessageCore: ({message, compressLevel}: {message: ClientMessage, compressLevel?: number}) => void;
  serverMessage:               ServerMessage | null;
};

// WebSocketCoreProvider ▽
export function WebSocketCoreProvider({ WebsocketUrl, WebsocketId, children,}: WebSocketCoreProviderProps): ReactElement {

  // WebSocket
  const socketRef   = useRef<WebSocket | null>(null);
  const brotliRef   = useRef<BrotliWasm | null>(null);
  const accessIdRef = useRef<string>('');
  // ping
  const pingIntervalRef  = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalTime = 5000;
  // 状態管理
  const [serverMessageState, setServerMessageState] = useState<ServerMessage | null>(null);
  const [isWebSocketWaiting, setIsWebSocketWaiting] = useState<boolean>(false);

  // --------------------
  // WebSocket 接続 / 再接続
  // --------------------
  // setUpWebSocketListeners: WebSocket イベントリスナー
  const setUpWebSocketListeners = useCallback(({ws, isReconnect}: {ws: WebSocket, isReconnect?: boolean}) => {
    // open
    ws.addEventListener('open', () => {
      setIsWebSocketWaiting(false);
      if (isReconnect) {
        ws.send(JSON.stringify({ cmd: 'Reconnect' }));
      };
      showToast('success', 'Connected', {position: 'bottom-right', duration: 3000,});
    });
    // message
    ws.addEventListener('message', (event: MessageEvent) => {
      handleReceiveMessage(event).catch(() => {
        showToast('error', 'socket error', {position: 'bottom-right', duration: 3000,});
      });
    });
    // close
    ws.addEventListener('close', () => {
      setIsWebSocketWaiting(false);
      showToast('info', 'Disconnected', {position: 'bottom-right', duration: 3000,});
    });
    // error
    ws.addEventListener('error', () => {
      showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000,});
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close();
        setIsWebSocketWaiting(false);
      };
    });
  }, []);

  // connectWebSocket: 新規接続
  const connectWebSocket = useCallback(async ({ isReconnect=false }: {isReconnect?: boolean} = {}): Promise<void> => {
    try {
      // 既存ソケットが CONNECTING or OPEN なら一旦閉じる
      if (socketRef.current) {
        const { readyState } = socketRef.current;
        if (readyState === WebSocket.CONNECTING || readyState === WebSocket.OPEN) {
          socketRef.current.close();
        };
      };
      // 新規ソケット生成
      const wsProtocol    = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const backendDomain = new URL(process.env.NEXT_PUBLIC_BACKEND_URL ?? '').host;
      const wsUrl         = `${wsProtocol}://${backendDomain}/${WebsocketUrl}${WebsocketId}`;
      const newSocket     = new WebSocket(wsUrl);
      setUpWebSocketListeners({ws: newSocket, isReconnect: isReconnect});
      socketRef.current = newSocket;
      console.log('connectWebSocket OK'); // Debug
    } catch {
      showToast('error', 'Connection error', { position: 'bottom-right', duration: 3000 });
    };
  }, [WebsocketId, WebsocketUrl, setUpWebSocketListeners]);

  // reConnectWebSocket: 再接続
  const reConnectWebSocket = useCallback( async (options: { isForced?: boolean } = {}): Promise<void> => {
    const { isForced = false } = options;
    const ws                   = socketRef.current;
    // ソケットが無ければ単純に接続
    if (!ws) {
      await connectWebSocket();
      return;
    };
    // 既に CONNECTING or OPEN で、強制フラグfalseなら何もしない
    if (!isForced && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      return;
    };
    // 一度クローズして再接続
    ws.close();
    // 再接続
    showToast('info', '自動的に再接続を試みます', {position: 'bottom-right', duration: 3000,});
    setIsWebSocketWaiting(false);
    await connectWebSocket({ isReconnect: true });
    // Debug
    console.log('reConnectWebSocket');
  }, [connectWebSocket]);

  // --------------------
  // 送信メソッド
  // --------------------
  // sendMessage: 送信共通処理
  const sendMessage = useCallback((
    message: ClientMessage,
    { compressLevel = 4,
      isWaitBlock   = true, }: {compressLevel?: number; isWaitBlock?: boolean; } = {}): void => {
    const ws = socketRef.current;
    if (!ws) {
      // ソケットが無ければ再接続
      void reConnectWebSocket();
      return;
    };
    // 多重送信など送信ブロックをかける場合
    // -> isWaitBlock = falase はシステムメッセージを想定
    if (isWaitBlock) {
      if (isWebSocketWaiting) {
        return;
      };
      // 送信できる場合 (多重送信をブロック)
      setIsWebSocketWaiting(true);
    };
    // 送信
    if (ws.readyState === WebSocket.OPEN) {
      // (共通処理)IDをセット
      message.request_user_access_id = accessIdRef.current;
      try {
        // Brotli圧縮
        if (compressLevel && brotliRef.current) {
          const jsonString     = JSON.stringify(message);
          const compressedData = brotliRef.current.compress(
            new TextEncoder().encode(jsonString),
            { quality: compressLevel },
          );
          ws.send(compressedData);
        } else {
          ws.send(JSON.stringify(message));
        };
      } catch {
        // 失敗したら非圧縮送信
        ws.send(JSON.stringify(message));
      };
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // 接続中なら特に何もせずに待つ
    } else {
      // CLOSE or エラー状態
      void reConnectWebSocket();
    };
  }, [isWebSocketWaiting]);
  // handleSendCore: UIから呼び出される送信ハンドラ
  //  呼び出し例:
  //   const handleClickSendMessage = () => {
  //    handleSendCore({cmd: 'cmd', data: { message: inputText }});
  //   };
  //   <button onClick={handleClickSendMessage} disabled={isWebSocketWaiting}>
  const handleSendCore = useCallback(({cmd, data}: {cmd: string, data: Record<string, string>}) => {
    // サニタイズ
    const safeData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        sanitizeDOMPurify(k),
        sanitizeDOMPurify(v),
      ]),
    );
    const message: ClientMessage = {
      cmd:  cmd,
      data: safeData,
    };
    // 送信
    sendMessage(message, { compressLevel: 4 });
  }, [sendMessage]);
  // handleSendSystemMessageCore: isWebSocketWaiting=true でも send 実行
  const handleSendSystemMessageCore = useCallback(({message, compressLevel}: {message: ClientMessage, compressLevel?: number}): void => {
    sendMessage(message, { compressLevel, isWaitBlock: false });
  }, [sendMessage]);

  // --------------------
  // 受信メソッド
  // --------------------
  // decodeReceivedData: WebSocketからのメッセージを処理
  const decodeReceivedData = useCallback( async (e: MessageEvent): Promise<ServerMessage> => {
    // 受信データがテキスト → 非圧縮とみなす
    if (typeof e.data === 'string') {
      return JSON.parse(e.data) as ServerMessage;
    };
    // 受信データがBlob(バイナリ) → Brotli 圧縮とみなす
    if (e.data instanceof Blob) {
      const reader = new FileReader();
      return new Promise<ServerMessage>((resolve, reject) => {
        reader.onload = () => {

          if (!reader.result)     return reject(new Error('parseError'));
          if (!brotliRef.current) return reject(new Error('parseError'));

          try {
            const compressedData   = new Uint8Array(reader.result as ArrayBuffer);
            const decompressedData = brotliRef.current.decompress(compressedData);
            const decodedString    = new TextDecoder('utf-8').decode(decompressedData);
            resolve(JSON.parse(decodedString) as ServerMessage);
          } catch {
            reject(new Error('parseError'));
          };
        };
        reader.onerror = () => reject(new Error('parseError'));
        reader.readAsArrayBuffer(e.data);
      });
    };
    // 型想定外
    throw new Error('parseError');
  }, []);

  // handleReceiveMessage
  async function handleReceiveMessage(e: MessageEvent): Promise<void> {
    try {
      const serverMessage = await decodeReceivedData(e);
      if (!serverMessage || typeof serverMessage !== 'object') {
        throw new Error('Invalid data');
      };
      const { cmd, ok, data } = serverMessage;
      // 共通処理 ▽
      // ping, pong, receiverMessage
      if (cmd === 'ping') return;
      if (cmd === 'pong') return;
      if (cmd === 'receiverMessage') return;
      // wsClose
      if (cmd === 'wsClose') {
        socketRef.current?.close();
        setIsWebSocketWaiting(false);
        return;
      // SetUserAccessId: アクセスID をセット
      } else if (cmd === 'SetUserAccessId' && data?.access_id) {
        if (ok) {
          const accessId      = sanitizeDOMPurify(String(data.access_id));
          accessIdRef.current = accessId;
        } else {
          showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000});
        };
        setIsWebSocketWaiting(false);
        return;
      // 共通処理 △
      } else {
        // 共通処理以外は Context で返す
        // setIsWebSocketWaiting=falseセットは useContext 側で行う
        setServerMessageState(serverMessage);
      };
    } catch {
      showToast('error', 'socket error', {position: 'bottom-right', duration: 3000});
      setIsWebSocketWaiting(false);
    };
  };

  // --------------------
  // ping
  // - socket 死活監視
  // - 切断状態なら handleSendSystemMessageCore を通して再接続を試みる
  // --------------------
  //  - sendPing
  const sendPing = useCallback(() => {
    handleSendSystemMessageCore({ message: {cmd: 'ping'} });
    console.log('ping'); // Debug
  }, [handleSendSystemMessageCore]);
  //  - startPing
  const startPing = useCallback(() => {
    // Ping が未設定の場合のみ設定
    if (!pingIntervalRef.current) {
      pingIntervalRef.current = setInterval(() => {
        sendPing();
      }, pingIntervalTime);
    };
  }, [sendPing]);
  //  - stopPing
  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    };
  }, []);

  // --------------------
  // 画面終了・タブ閉じなど
  // --------------------
  // closeSocketAll: 主に画面が閉じられる時などの共通処理
  const closeSocketAll = useCallback((): void => {
    if (socketRef.current) {
      socketRef.current.close();
    };
    stopPing();
  }, [stopPing]);

  // --------------------
  // マウント時の初期処理
  // --------------------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!isMounted) return;
      // brotli-wasm ロード
      try {
        brotliRef.current = await brotliPromise;
      } catch {
        brotliRef.current = null; // 失敗しても非圧縮で続行
      };
      // ソケット接続開始
      await connectWebSocket();
    })();

    // Ping開始
    startPing();
    
    // タブを閉じる・リロード前
    const handleBeforeUnload = () => {
      if (socketRef.current?.readyState === WebSocket.CONNECTING || socketRef.current?.readyState === WebSocket.OPEN) {
        closeSocketAll();
      };
    };
    // タブ可視状態変化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 非アクティブになったら閉じる
        closeSocketAll();
      } else {
        // アクティブになったら再接続 & Ping
        void reConnectWebSocket({ isForced: true });
        sendPing();
        startPing();
      };
    };

    // イベント登録
    window.addEventListener('beforeunload',       handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup(アンマウント時)
    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload',       handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      closeSocketAll();
    };
  }, [WebsocketId]);

  // --------------------
  // contextValue
  // --------------------
  const contextValue: WebSocketCoreContextValue = {
    socketRef,
    accessIdRef,
    isWebSocketWaiting,
    setIsWebSocketWaiting,
    handleSendCore,
    handleSendSystemMessageCore,
    serverMessage: serverMessageState,
  };

  return (
    <WebSocketCoreContext.Provider value={contextValue}>
      {children}
    </WebSocketCoreContext.Provider>
  );
};
// WebSocketCoreProvider △

// WebSocketCoreContext
export const WebSocketCoreContext = createContext<WebSocketCoreContextValue | null>(null);