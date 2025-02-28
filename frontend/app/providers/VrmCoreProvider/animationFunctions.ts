// lib/vrm/animations.ts
import type { VRM } from '@pixiv/three-vrm';

// リップシンク ▽
// 音量を解析してVRMのリップシンクを制御
// 返り値でストップ用の関数を渡す
// Ref. https://qiita.com/daifukusan/items/de74f272e71dd87f853c
type StartLipSyncProps = {
  vrm:       VRM,
  analyser:  AnalyserNode,
  dataArray: Uint8Array,
};
export function startLipSync({vrm, analyser, dataArray}: StartLipSyncProps): () => void {

  const { expressionManager }  = vrm;
  let requestId: number | null = null;
  let isLipSyncActive: boolean = true;

  if (!expressionManager) return () => {};

  let consecutiveZeroCount: number = 0;

  function updateLipSync(): void {
    if (!isLipSyncActive) return;
    analyser.getByteFrequencyData(dataArray);
    let sum: number = 0;
    for (let i = 0; i < dataArray.length; i += 1) {
      sum += dataArray[i];
    };
    const average: number = sum / dataArray.length;
    const volume: number  = Math.floor(average);
    // 300フレーム(約5sec)連続で0ならループ終了
    if (volume === 0) consecutiveZeroCount++;
    else consecutiveZeroCount = 0;
    if (consecutiveZeroCount >= 300) {
      stopLipSync();
      return;
    };
    // 音量に応じて表情を設定
    const { expressionManager } = vrm;
    if (expressionManager) {
      const aa: number    = Math.pow(Math.min(80,    volume                    ), 2) / 3200.0;
      const oh: number    = Math.pow(Math.max(40.0 - Math.abs(volume - 40.0), 0), 2) / 1600.0;
      const ih: number    = Math.pow(Math.max(20.0 - Math.abs(volume - 20.0), 0), 2) / 400.0;
      const happy: number = (aa + oh + ih) / 6.0; // 'happy' は3つの値の平均を用いる
      if (volume < 10) {
        expressionManager.setValue('aa',    0.0);
        expressionManager.setValue('oh',    0.0);
        expressionManager.setValue('ih',    0.0);
        expressionManager.setValue('happy', 0.0);
      } else {
        expressionManager.setValue('aa',    aa * (2 / 3));
        expressionManager.setValue('oh',    oh * (2 / 3));
        expressionManager.setValue('ih',    ih * (2 / 3));
        expressionManager.setValue('happy', happy);
      };
      expressionManager.update();
    };
    requestAnimationFrame(updateLipSync); // ループ継続
  };
  requestAnimationFrame(updateLipSync);   // ループ開始
  // 停止関数
  function stopLipSync() {
    isLipSyncActive = false;
    if (requestId != null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    };
    // デフォルト表情
    expressionManager?.setValue('aa',      0.0);
    expressionManager?.setValue('oh',      0.0);
    expressionManager?.setValue('ih',      0.0);
    expressionManager?.setValue('happy',   0.0);
    expressionManager?.setValue('relaxed', 0.2);
    expressionManager?.update();
  };
  return stopLipSync;
};
// リップシンク △

// 瞬き ▽
export let blinkingTimeoutId: ReturnType<typeof setTimeout> | null = null;
export type StartBlinkingOptions = {
  blinkInterval?:      number;
  blinkDuration?:      number;
  blinkIntervalFluct?: number;
  blinkProbability?:   number;
};
export function startBlinking(
  vrm: VRM,
  { blinkInterval      = 3000, // 次の瞬き動作を開始するまでのベースインターバル(ms)
    blinkDuration      = 100,  // 瞬きの時間(ms)
    blinkIntervalFluct = 1500, // ベースインターバルのゆらぎ(ms)
    blinkProbability   = 0.5,  // 瞬きする確率
  }: StartBlinkingOptions={},): void {
  const blink = () => {
    // 設定確率で瞬き
    if (Math.random() < blinkProbability) {
      vrm.expressionManager?.setValue('blink', 1.0);
      vrm.expressionManager?.update();
      setTimeout(() => {
        vrm.expressionManager?.setValue('blink', 0.0);
        vrm.expressionManager?.update();
      }, blinkDuration);
    };
    // blinkInterval に blinkIntervalFluct の乱数を足して、瞬きのタイミングを揺らす
    blinkingTimeoutId = setTimeout(blink, blinkInterval + Math.random() * blinkIntervalFluct);
  };
  blinkingTimeoutId = setTimeout(blink, blinkInterval);
};
// 瞬き △

// 呼吸 ▽
export type StartBreathingOptions = {
  breathInterval?:  number;
  breathDuration?:  number;
  mouthOpeningVal?: number;
};
export function startBreathing(
  vrm: VRM,
  { breathInterval  = 10033, // 次の瞬き動作を開始するまでのベースインターバル(ms)
    breathDuration  = 500,   // 口を開いたままにする時間(ms)
    mouthOpeningVal = 0.05,  // 口の開き具合
  }: StartBreathingOptions={},): void {
  setInterval(() => {
    vrm.expressionManager?.setValue('ee', mouthOpeningVal);
    vrm.expressionManager?.update();
    setTimeout(() => {
      vrm.expressionManager?.setValue('ee', 0.0);
      vrm.expressionManager?.update();
    }, breathDuration);
  }, breathInterval);
};
// 呼吸 △

// 左右動き (ゆらゆら) ▽
export type StartSwayingOptions = {
  swaySpeed?:   number;
  maxRotation?: number;
};
export function startSwaying(
  vrm: VRM,
  { swaySpeed   = 0.01,    // 動きのスピード. 値が大きいと早く揺れる.
    maxRotation = 0.00015, // 最大回転角度 (ラジアン)
  }: StartSwayingOptions={},): void {
  let swayTime: number = 0;
  const swayLoop = () => {
    const rotationZ = maxRotation * Math.sin(swayTime);
    vrm.scene.rotation.z = rotationZ;
    swayTime             += swaySpeed;
    requestAnimationFrame(swayLoop);
  };
  requestAnimationFrame(swayLoop);
};
// 左右動き (ゆらゆら) △

// よそ見 ▽
export type StartRandomEyeMovementOptions = {
  eyeMovementInterval?:    number;
  eyeMovementDuration?:    number;
  eyeMovementProbability?: number;
  angleVal?:               number;
};
export function startRandomEyeMovementWithDice(
  vrm: VRM,
  { eyeMovementInterval    = 10000, // 次の瞬き動作を開始するまでのベースインターバル(ms)
    eyeMovementDuration    = 300,   // 視線を動かす時間(ms)
    eyeMovementProbability = 0.1,   // 視線を動かす確率
    angleVal               = 0.05,  // 回転角度の上限 (ex. 0.05 -> -0.05～0.05)
  }: StartRandomEyeMovementOptions={},): void {
  function lookRandomly() {
    const leftEye  = vrm.humanoid?.getNormalizedBoneNode('leftEye');
    const rightEye = vrm.humanoid?.getNormalizedBoneNode('rightEye');
    if (!leftEye || !rightEye) return;

    const angle: number = (((Math.random() - 0.5)/5)*10) * angleVal;
    leftEye.rotation.y  = angle;
    rightEye.rotation.y = angle;
    vrm.humanoid?.update();

    // eyeMovementDuration ms 後に正面に戻す
    setTimeout(() => {
      leftEye.rotation.y = 0;
      rightEye.rotation.y = 0;
      vrm.humanoid?.update();
    }, eyeMovementDuration);
  };
  const checkDice = () => {
    // 設定確率でよそ見する
    if (Math.random() < eyeMovementProbability) lookRandomly();
    setTimeout(checkDice, eyeMovementInterval);
  };
  checkDice();
};
// よそ見 △