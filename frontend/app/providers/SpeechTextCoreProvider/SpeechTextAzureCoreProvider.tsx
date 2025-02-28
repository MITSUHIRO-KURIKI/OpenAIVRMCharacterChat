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
// SDK
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
  SpeechSynthesizer,
  type SpeechRecognitionEventArgs,
} from 'microsoft-cognitiveservices-speech-sdk';
// features
import { getTokenOrRefresh, type AzureTokenResponse } from '@/features/api/third_party';
import { getCookie } from '@/features/utils';
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast, isDialogOpenInDOM } from '@/app/components/utils';
// import
import type { SpeechTextCoreContextValue } from './type.d';


// type
type SpeechTextAzureCoreProviderProps = {
  isStopRecognitionDelay?: number;
  recognitionLanguage?:    string;
  speechVoiceName?:        string;
  children:                ReactNode;
};

// SpeechTextAzureCoreProvider ▽
export function SpeechTextAzureCoreProvider({
  isStopRecognitionDelay = 400,
  recognitionLanguage    = 'ja-JP',
  speechVoiceName        = 'ja-JP-AoiNeural',
  children }: SpeechTextAzureCoreProviderProps): ReactElement {

  // Recognizer/Synthesizer
  const recognizerRef  = useRef<SpeechRecognizer  | null>(null);
  const synthesizerRef = useRef<SpeechSynthesizer | null>(null);
  // STT
  const [recognizingText, setRecognizingText] = useState<string>('');
  const [recognizedText, setRecognizedText]   = useState<string[]>([]);
  const allrecognizedTextRef                  = useRef<string[]>([]);
  // TTS
  const [isSpeechStreaming, setIsSpeechStreaming] = useState<boolean>(false);
  const [speechDataArray, setSpeechDataArray]     = useState<Uint8Array | null>(null);
  const [speechAnalyser, setSpeechAnalyser]       = useState<AnalyserNode | null>(null);
  // ステータス管理
  const [isLoading, setIsLoading]                 = useState<boolean>(false);
  const [isRecognizing, setIsRecognizing]         = useState<boolean>(false);
  const [isStopRecognition, setIsStopRecognition] = useState<boolean>(false);
  const isSpacePressedRef                         = useRef<boolean>(false);
  const sendProcessRef                            = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef                           = useRef<AudioContext | null>(null);
  const sourceRef                                 = useRef<AudioBufferSourceNode | null>(null);
  // Cookie プレフィックス
  const recognizerCookiePrefix  = 're-';
  const synthesizerCookiePrefix = 'sy-';

  // getSpeechToken
  const getSpeechToken = useCallback(async ({cookiePrefix}: {cookiePrefix: string}): Promise<AzureTokenResponse> => {
    const speechToken = getCookie(`${cookiePrefix}speech-token`);
    if (speechToken) {
      // "accessToken:region" の形
      const idx = speechToken.indexOf(':');
      return {
        accessToken: speechToken.slice(0, idx),
        region:      speechToken.slice(idx + 1),
      };
    } else {
      // API から取得
      return await getTokenOrRefresh({ cookiePrefix });
    };
  }, []);

  /**
   * STT:SpeechRecognizer セットアップ
   */
  // initRecognizer
  const initRecognizer = useCallback(({recognizer}: {recognizer: SpeechRecognizer}) => {
    // recognizing
    recognizer.recognizing = (_: unknown, e: SpeechRecognitionEventArgs) => {
      if (e.result.reason === ResultReason.RecognizingSpeech) {
        const safeText = sanitizeDOMPurify(e.result.text)
        setRecognizingText(safeText);
      };
    };
    // recognized
    recognizer.recognized = (_: unknown, e: SpeechRecognitionEventArgs) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        setRecognizingText('');
        const safeText = sanitizeDOMPurify(e.result.text)
        setRecognizedText((prev) => [...prev, safeText]);
        allrecognizedTextRef.current = [...allrecognizedTextRef.current, safeText];
      } else if (e.result.reason === ResultReason.NoMatch) {
        showToast('info', 'No speech?', {position: 'bottom-right', duration: 3000});
      };
    };
    // canceled
    recognizer.canceled = () => {
      showToast('info', 'canceled', {position: 'bottom-right', duration: 3000});
    };
    // sessionStopped: Speech2Text 終了時に毎回呼び出される
    recognizer.sessionStopped = () => {
      // showToast('info', 'Recognition session stopped', {position: 'bottom-right', duration: 3000});
    };
    return recognizer;
  }, []);
  // recognizerCheckAndSetup: Speech2Text
  const recognizerCheckAndSetup = useCallback(async (): Promise<void> => {
    if (recognizerRef.current) return;

    try {
      const tokenObj = await getSpeechToken({cookiePrefix: recognizerCookiePrefix});
      // recognizer 作成 ▽
      const speechConfig                     = SpeechConfig.fromAuthorizationToken(tokenObj.accessToken, tokenObj.region);
      speechConfig.speechRecognitionLanguage = recognitionLanguage;
      const audioConfig                      = AudioConfig.fromDefaultMicrophoneInput();
      const recognizer                       = new SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current                  = initRecognizer({recognizer: recognizer});
      // recognizer 作成 △
    } catch {
      showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000,});
    };
  }, [getSpeechToken, initRecognizer, recognitionLanguage]);

  /**
   * TTS:SpeechSynthesizer セットアップ
   */
  // synthesizerCheckAndSetup: Text2Speech
  const synthesizerCheckAndSetup = useCallback(async (): Promise<void> => {
    if (synthesizerRef.current) return;

    try {
      const tokenObj = await getSpeechToken({cookiePrefix: synthesizerCookiePrefix});
      // synthesizer 作成 ▽
      const speechConfig                    = SpeechConfig.fromAuthorizationToken(tokenObj.accessToken, tokenObj.region);
      speechConfig.speechSynthesisVoiceName = speechVoiceName;
      const audioConfig                     = null;
      synthesizerRef.current                = new SpeechSynthesizer(speechConfig, audioConfig);
      // synthesizer 作成 △
    } catch {
      showToast('error', 'Connection error', {position: 'bottom-right',duration: 3000,});
    };
  }, [getSpeechToken, speechVoiceName]);

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
  const startRecognition = useCallback((): void => {
    // 認識中なら何もしない
    if (isRecognizing) return;
    setIsRecognizing(true);
    setIsStopRecognition(false);

    // 再生中の音声があればストップ
    stopAudioPlayback();

    // sendProcessRef が残っていればクリア (再開時にまとめ送信しないように)
    if (sendProcessRef.current) {
      clearTimeout(sendProcessRef.current);
      sendProcessRef.current = null;
    };

    // 蓄積をクリア ▽
    setRecognizingText('');
    setRecognizedText([]);
    allrecognizedTextRef.current = [];
    // 蓄積をクリア △

    if(recognizerRef.current) {
      recognizerRef.current.startContinuousRecognitionAsync(() => {
        // 認識スタート
        setIsLoading(false);
      }, () => {
        // 失敗
        setIsLoading(false);
        showToast('error', 'Failed to start recognition', { position: 'bottom-right', duration: 3000});
        if (recognizerRef.current) {
          recognizerRef.current.stopContinuousRecognitionAsync();
          recognizerRef.current = null;
        };
      },);
    } else {
      showToast('error', 'Failed to start recognition', { position: 'bottom-right', duration: 3000});
    };
  }, [isRecognizing, stopAudioPlayback]);

  // stopRecognition: 音声認識の停止
  const stopRecognition = useCallback((): void => {
    // 認識終了後なら何もしない
    if (!isRecognizing) return;
    setIsRecognizing(false);

    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        // isStopRecognitionDelay ms 後にまとめて isStopRecognition 送信
        sendProcessRef.current = setTimeout(() => {
          // 利用側は isStopRecognition=true で発火するメッセージ処理関数を独自に用意する
          setIsStopRecognition(true);
          // 認識中履歴クリア
          setRecognizingText('');
        }, isStopRecognitionDelay);
      }, () => {
        showToast('error', 'Failed to stop recognition', {position: 'bottom-right', duration: 3000});
        recognizerRef.current = null;
      },);
    } else {
      showToast('error', 'Failed to stop recognition', {position: 'bottom-right', duration: 3000});
    };
  }, [isRecognizing, isStopRecognitionDelay]);

  // --------------------
  // Text-to-Speech
  // --------------------
  // textToSpeech
  const textToSpeech = useCallback(async (SpeechText: string): Promise<void> => {
    setIsLoading(false);
    try{
      // 空は音声生成できないので返す
      if(!SpeechText) return;

      await synthesizerCheckAndSetup();

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
      // リップシンク解析用
      const analyser   = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const dataArray  = new Uint8Array(analyser.frequencyBinCount);
      // AudioContext 作成 △

      if (synthesizerRef.current) {
        synthesizerRef.current.speakTextAsync( SpeechText, (result) => {
          if (result.reason === ResultReason.SynthesizingAudioCompleted) {
            // 音声合成完了
            const audioData = result.audioData;
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
                showToast('warning', 'tts error 1', {position: 'bottom-right', duration: 3000});
              },
            );
          } else if (result.reason === ResultReason.Canceled) {
            showToast('warning', 'tts error 2', {position: 'bottom-right', duration: 3000});
          };}, () => {
            showToast('warning', 'tts error 3', {position: 'bottom-right', duration: 3000});
            if (synthesizerRef.current) {
              synthesizerRef.current.close();
              synthesizerRef.current = null;
            };
          },
        );
      } else {
        showToast('warning', 'tts error 4', {position: 'bottom-right', duration: 3000});
      };
    } catch {
      showToast('warning', 'tts error 5', {position: 'bottom-right', duration: 3000});
    };
  }, [synthesizerCheckAndSetup, synthesizerRef.current, audioContextRef.current, speechAnalyser, speechDataArray ]);
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
  }, [recognizerCheckAndSetup, startRecognition, stopRecognition]);

  // --------------------
  // 初期化
  // --------------------
  // Provider 初回マウント時に、それぞれをセットアップ
  useEffect(() => {
    (async () => {
      await recognizerCheckAndSetup();
      await synthesizerCheckAndSetup();
    })();
  }, [recognizerCheckAndSetup, synthesizerCheckAndSetup]);

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
    <SpeechTextAzureCoreContext.Provider value={contextValue}>
      {children}
    </SpeechTextAzureCoreContext.Provider>
  );
};
// SpeechTextAzureCoreProvider △

// SpeechTextAzureCoreContext
export const SpeechTextAzureCoreContext = createContext<SpeechTextCoreContextValue | null>(null);