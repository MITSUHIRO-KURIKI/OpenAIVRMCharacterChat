/**
 * 独自に isStopRecognition=true で発火する関数を子コンポーネントで用意して、
 * allrecognizedTextRef(認識後のテキスト全文) 等を処理.
 *  - allrecognizedTextRef.current.join('')
 * 発話は textToSpeech(**text**) で行う.
 * isSpeechStreaming を使ってストリーミング終了時の処理をすることができる.
 * なお、 Provider 側では キーダウン時には recognizedText と allrecognizedTextRef
 * をクリアするが、処理後にはクリアしないのでクリアしたい場合などは
 *  - setRecognizedText([]);
 *  - allrecognizedTextRef.current = [];
 * などで独自にクリアする.
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
} from 'react';
// lib
import RecordRTC from 'recordrtc';
// features
import { thirdPartyPath } from '@/features/paths/backend';
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast, isDialogOpenInDOM } from '@/app/components/utils';
// import
import type { ClientMessage } from '@/app/providers/WebSocketCoreProvider/type.d';
import type { SpeechTextCoreContextValue } from './type.d';


// type
type SpeechTextGcloudCoreProviderProps = {
  sendSTTIntervalTime?: number;
  children:             ReactNode;
};

// SpeechTextGcloudCoreProvider ▽
export function SpeechTextGcloudCoreProvider({
  sendSTTIntervalTime = 25,
  children }: SpeechTextGcloudCoreProviderProps): ReactElement {

  // WebSocket
  const socketRef        = useRef<WebSocket | null>(null);
  const pingIntervalRef  = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalTime = 5000;
  // STT
  const [recognizingText, setRecognizingText] = useState<string>('');
  const [recognizedText, setRecognizedText]   = useState<string[]>([]);
  const allrecognizedTextRef                  = useRef<string[]>([]);
  const recognizingTextRef                    = useRef<string>('');
  // TTS
  const [isSpeechStreaming, setIsSpeechStreaming] = useState<boolean>(false);
  const [speechDataArray, setSpeechDataArray]     = useState<Uint8Array | null>(null);
  const [speechAnalyser, setSpeechAnalyser]       = useState<AnalyserNode | null>(null);
  // ステータス管理
  const [isLoading, setIsLoading]                 = useState<boolean>(false);
  const [isRecognizing, setIsRecognizing]         = useState<boolean>(false);
  const [isStopRecognition, setIsStopRecognition] = useState<boolean>(false);
  const isSpacePressedRef                         = useRef<boolean>(false);
  const mediaRecorderRef                          = useRef<RecordRTC | null>(null);
  const audioContextRef                           = useRef<AudioContext | null>(null);
  const sourceRef                                 = useRef<AudioBufferSourceNode | null>(null);

  /**
   * ==========
   * Socket ▽
   * ==========
   */
  // --------------------
  // WebSocket 接続 / 再接続
  // --------------------
  // setUpWebSocketListeners: WebSocket イベントリスナー
  const setUpWebSocketListeners = useCallback(({ws, isReconnect}: {ws: WebSocket, isReconnect?: boolean}) => {
    // open
    ws.addEventListener('open', () => {
      if (isReconnect) {
        ws.send(JSON.stringify({ cmd: 'Reconnect' }));
      };
    });
    // message
    ws.addEventListener('message', (event: MessageEvent) => {
      handleReceiveMessage(event).catch(() => {
        showToast('error', 'gclodud socket error', {position: 'bottom-right', duration: 3000,});
      });
    });
    // close
    ws.addEventListener('close', () => {
      //
    });
    // error
    ws.addEventListener('error', () => {
      showToast('error', 'gclodud socket Connection error', {position: 'bottom-right', duration: 3000,});
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close();
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
      const wsProtocol     = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const backendDomain  = new URL(process.env.NEXT_PUBLIC_BACKEND_URL ?? '').host;
      const wsUrl          = `${wsProtocol}://${backendDomain}/${thirdPartyPath.gcloud.ws_stt_tts}`;
      const newSocket      = new WebSocket(wsUrl);
      newSocket.binaryType = 'arraybuffer'; // バイナリを扱う宣言
      setUpWebSocketListeners({ws: newSocket, isReconnect: isReconnect});
      socketRef.current = newSocket;
      console.log('gcloud connectWebSocket OK');    // Debug
    } catch {
      console.log('gcloud connectWebSocket error'); // Debug
    };
  }, [setUpWebSocketListeners]);

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
    await connectWebSocket({ isReconnect: true });
    // Debug
    console.log('gcloud reConnectWebSocket');
  }, [connectWebSocket]);

  // --------------------
  // 送信メソッド
  // --------------------
  // sendMessage: 送信共通処理
  const sendMessage = useCallback(({cmd, text}: {cmd: string, text?: string}): void => {
    const ws = socketRef.current;
    if (!ws) {
      // ソケットが無ければ再接続
      void reConnectWebSocket();
      return;
    };
    // 送信
    if (ws.readyState === WebSocket.OPEN) {
      try {
        const message: ClientMessage = {
          cmd:  sanitizeDOMPurify(cmd),
          data: {
            text: sanitizeDOMPurify(text),
          },
        };
        ws.send(JSON.stringify(message));
      } catch {
        showToast('error', 'error', {position: 'bottom-right', duration: 3000,});
      };
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // 接続中なら特に何もせずに待つ
    } else {
      // CLOSE or エラー状態
      void reConnectWebSocket();
    };
  }, []);
  const sendBlob = useCallback(({blobData}: {blobData: ArrayBuffer | Uint8Array}): void => {
    const ws = socketRef.current;
    if (!ws) {
      // ソケットが無ければ再接続
      void reConnectWebSocket();
      return;
    };
    // 送信
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(blobData);
      } catch {
        showToast('error', 'error', {position: 'bottom-right', duration: 3000,});
      };
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // 接続中なら特に何もせずに待つ
    } else {
      // CLOSE or エラー状態
      void reConnectWebSocket();
    };
  }, []);

  // --------------------
  // 受信メソッド
  // --------------------
  // handleReceiveMessage
  async function handleReceiveMessage(event: MessageEvent): Promise<void> {
    try {
      if (typeof event.data === 'string') {
        const dataStr = event.data;
        const data    = JSON.parse(dataStr);
        if (data.cmd) {
          // ping, pong, receiverMessage
          if (data.cmd === 'ping') return;
          if (data.cmd === 'pong') return;
          if (data.cmd === 'receiverMessage') return;
          // --------------------
          // Text-to-Speech
          // --------------------
          if (data.cmd === 'tts') {
            try {
              if (!data.ok) {
                showToast(data?.toastType ?? 'info', data?.toastMessage ?? 'No speech?');
                return;
              };
              if (!data.audioContent) {
                showToast(data?.toastType ?? 'info', data?.toastMessage ?? 'No speech?');
                return;
              };
              // Base64 → ArrayBuffer ▽
              const binary = atob(data.audioContent);
              const len    = binary.length;
              const buffer = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                buffer[i] = binary.charCodeAt(i);
              };
              const audioData = buffer.buffer;
              if (!audioData) {
                showToast(data?.toastType ?? 'info', data?.toastMessage ?? 'No speech?');
                return;
              };
              // Base64 → ArrayBuffer △
              // AudioContext 作成 ▽
              if (audioContextRef.current) {
                if(audioContextRef.current.state !== 'closed') audioContextRef.current.close();
                audioContextRef.current = null;
              };
              const audioContext      = new AudioContext();
              audioContextRef.current = audioContext;
              if (!audioContext) {
                // ブラウザがサポート外
                // 使用環境によっては new (window.AudioContext || window.webkitAudioContext)(); を検討
                showToast('warning', 'AudioContext not supported', {position: 'bottom-right', duration: 3000});
                return;
              };
              // AudioContext 作成 △
              // リップシンク解析用
              const analyser   = audioContext.createAnalyser();
              analyser.fftSize = 2048;
              const dataArray  = new Uint8Array(analyser.frequencyBinCount);
              // 音声合成完了
              audioContext.decodeAudioData(audioData, (buffer) => {
                  const source      = audioContext.createBufferSource();
                  source.buffer     = buffer;
                  sourceRef.current = source;
                  // AudioContextにanalyserを接続してリップシンク用に解析
                  source.connect(analyser);
                  analyser.connect(audioContext.destination);
                  setSpeechDataArray(dataArray); // VRMでリップシンクする際にstartLipSyncに渡す
                  setSpeechAnalyser(analyser);   // VRMでリップシンクする際にstartLipSyncに渡す
                  // 音声再生
                  setIsSpeechStreaming(true);
                  source.start(0);
                }, () => {
                  showToast('warning', 'error1', {position: 'bottom-right', duration: 3000});
                },
              );
            } catch {
              showToast('warning', 'error2', {position: 'bottom-right', duration: 3000});
            };
          };
        } else {
          // --------------------
          // Speech-to-Text
          // --------------------
          if (!data.is_end) {
            if (!data.is_final) {
              // 一文未確定
              const safeText = sanitizeDOMPurify(data.transcript);
              // 同一文章や単語レベルで返ってくるので一旦文字数が多いのが来たら入れる
              if (safeText.length > recognizingTextRef.current.length) {
                setRecognizingText(safeText);
                recognizingTextRef.current = safeText;
              };
            } else {
              // 一文確定
              setRecognizingText('');
              recognizingTextRef.current = '';
              const safeText = sanitizeDOMPurify(data.transcript);
              setRecognizedText((prev) => [...prev, safeText]);
              allrecognizedTextRef.current = [...allrecognizedTextRef.current, safeText];
            };
          } else {
            // STT 終了 (キーボード離した後)
            // 認識途中のがあれば入れる
            setRecognizedText((prev) => [...prev, recognizingTextRef.current]);
            allrecognizedTextRef.current = [...allrecognizedTextRef.current, recognizingTextRef.current];
            // 利用側は isStopRecognition=true で発火するメッセージ処理関数を独自に用意する
            setIsStopRecognition(true);
            // 認識中履歴クリア
            setRecognizingText('');
            recognizingTextRef.current = '';
          };
        };
      } else {
        //
      };
    } catch {
      //
    };
  };

  // --------------------
  // ping
  // - socket 死活監視
  // - 切断状態なら sendMessage を通して再接続を試みる
  // --------------------
  //  - sendPing
  const sendPing = useCallback(() => {
    sendMessage({cmd: 'ping'});
    console.log('gcloud ping'); // Debug
  }, [sendMessage]);
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
      if (isMounted) {
        // WebSocket接続
        await connectWebSocket();
      };
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
  }, []);
  /**
   * ==========
   * Socket △
   * ==========
   */

  /**
   * ==========
   * STT/TTS ▽
   * ==========
   */
  // stopAudioPlayback
  // 現在のTTS再生を停止、AudioContextをリセット
  const stopAudioPlayback = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    };
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    };
    setIsSpeechStreaming(false);
  }, []);
  // --------------------
  // Speech-To-Text
  // --------------------
  // startRecognition: 音声認識の開始
  const startRecognition = useCallback( async (): Promise<void> => {
    // 認識中なら何もしない
    if (isRecognizing) return;
    setIsRecognizing(true)
    setIsStopRecognition(false);

    // 再生中の音声があればストップ
    stopAudioPlayback();

    // 蓄積をクリア ▽
    setRecognizingText('');
    recognizingTextRef.current = '';
    setRecognizedText([]);
    allrecognizedTextRef.current = [];
    // 蓄積をクリア △

    // ブラウザマイク取得
    if (mediaRecorderRef.current) {
       mediaRecorderRef.current.stopRecording(() => {
         mediaRecorderRef.current = null;
       });
    };
    const stream        = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new RecordRTC(stream, {
      type:                  'audio',
      mimeType:              'audio/wav',                                                                                                                                                           
      recorderType:          RecordRTC.StereoAudioRecorder,
      desiredSampRate:       16000,
      timeSlice:             sendSTTIntervalTime,
      numberOfAudioChannels: 1,
      ondataavailable: function (blob) {
        // dataavailable のコールバック。ここで blob を WebSocket 送信
        if (blob.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buf) => {
            sendBlob({blobData: buf});
          });
        };
      },
    });
    // 準備完了 -> STT開始
    setIsLoading(false);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.startRecording();
  }, [isRecognizing]);

  // stopRecognition: 音声認識の停止
  const stopRecognition = useCallback((): void => {
    // 認識終了後なら何もしない
    if (!isRecognizing) return;
    setIsRecognizing(false);

    // MediaRecorder 停止
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(() => {
        mediaRecorderRef.current = null;
      });
    };
    
    // STT socket に終了のバイナリを注入する -> これをsocketが受け取ってレシーブしたらSTT終了とする
    const encoder = new TextEncoder();
    const data    = encoder.encode('sttend');
    sendBlob({blobData: data});
  }, [isRecognizing]);

  // --------------------
  // Text-to-Speech
  // --------------------
  // textToSpeech
  const textToSpeech = useCallback(async (SpeechText: string): Promise<void> => {
    setIsLoading(false);
    sendMessage({
      cmd:  'tts',
      text: SpeechText,
    })
  }, []);
  /**
   * ==========
   * STT/TTS △
   * ==========
   */

  // --------------------
  // 操作イベント登録
  // --------------------
  // Speech2Text
  // ボタン操作
  const toggleRecognition = useCallback(() => {
    if (!isRecognizing) {
      setIsLoading(true);
      startRecognition();
    } else {
      setIsLoading(true); // setIsLoading(false); は textToSpeech() が呼ばれたら
      stopRecognition();
    };
  }, [isRecognizing, startRecognition, stopRecognition]);
  // キーイベント登録: スペースキー押下/離し
  useEffect(() => {
    // スペースキーを押している間だけ音声認識を開始する
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
      if (
        // 入力中なら無視
        e.target instanceof HTMLElement &&
        ( e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable
        ) ||
        // モーダルが開いているなら無視
        isDialogOpenInDOM() ||
        // スペースキー以外やリピートは無視
        e.code !== 'Space' || e.repeat ||
        // 既にスペース押下中なら無視
        isSpacePressedRef.current
      ) return;

      e.preventDefault();
      e.stopPropagation();
      
      isSpacePressedRef.current = true;
      setIsLoading(true);
      await startRecognition();
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      // スペースキー以外,押下中なら無視
      if (e.code !== 'Space' || !isSpacePressedRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      isSpacePressedRef.current = false;
      setIsLoading(true); // setIsLoading(false); は textToSpeech() が呼ばれたら
      stopRecognition();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);
    // cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
    };
  }, [startRecognition, stopRecognition]);

  // --------------------
  // contextValue
  // --------------------
  const contextValue: SpeechTextCoreContextValue = {
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
    isSpacePressedRef,
    toggleRecognition,
    textToSpeech,};

  return (
    <SpeechTextGcloudCoreContext.Provider value={contextValue}>
      {children}
    </SpeechTextGcloudCoreContext.Provider>
  );
};
// SpeechTextGcloudCoreProvider △

// SpeechTextCoreContext
export const SpeechTextGcloudCoreContext = createContext<SpeechTextCoreContextValue | null>(null);