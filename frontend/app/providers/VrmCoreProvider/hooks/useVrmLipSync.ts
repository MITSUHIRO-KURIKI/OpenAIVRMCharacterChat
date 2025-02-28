'use client';

// react
import { useEffect, useRef } from 'react';
// lib
import { VRM } from '@pixiv/three-vrm';
// include
import { startLipSync } from '../animationFunctions';


// type
type UseVrmLipSyncProps = {
  isSpeechStreaming: boolean;
  vrm:               VRM | null;
  speechAnalyser:    AnalyserNode | null;
  speechDataArray:   Uint8Array | null;
};

// useVrmLipSync
// - VRM リップシンクのためのカスタムフック
export function useVrmLipSync({
  isSpeechStreaming,
  vrm,
  speechAnalyser,
  speechDataArray, }: UseVrmLipSyncProps ) {

  const stopLipSyncRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isSpeechStreaming && vrm && speechAnalyser && speechDataArray) {
        stopLipSyncRef.current = startLipSync({
          vrm:       vrm,
          analyser:  speechAnalyser,
          dataArray: speechDataArray,
        });
    } else {
      stopLipSyncRef.current(); // 停止
    };
  }, [isSpeechStreaming, vrm, speechAnalyser, speechDataArray, startLipSync]);
};