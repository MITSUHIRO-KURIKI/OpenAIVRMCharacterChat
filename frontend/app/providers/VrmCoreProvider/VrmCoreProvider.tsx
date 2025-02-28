// Ref:
//  - https://pixiv.github.io/three-vrm/packages/three-vrm/docs/index.html
//  - https://github.com/pixiv/three-vrm/blob/dev/docs/migration-guide-1.0.md

/**
 * 基本的な設置 containerRef を div の ref に入れて表示
 * ``` 
 * <div ref = {containerRef}
 *      className = {cn(`w-[${width}px] h-[${height}px]`)} />
 * ``` 
 * 
 * 別途リップシンクする場合には、SpeechTextCoreProvider の
 * apeechAnalyser speechDataArray を受け取ったら startLipSync に vrm object 
 * と一緒に入れる
 * ```
 *   useEffect(() => {
 *     if (!vrmContext || !currentVrm || !apeechAnalyser || !speechDataArray) return;
 *     startLipSync(currentVrm, apeechAnalyser, speechDataArray);
 *   }, [currentVrm, apeechAnalyser, speechDataArray]);
 * ```
 */
'use client';

// react
import {
  createContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  type ReactElement,
  type MutableRefObject,
} from 'react';
// lib
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Clock,
  AmbientLight,
} from 'three';
import {
  VRM,
  VRMUtils,
} from '@pixiv/three-vrm';
// components
import { showToast } from '@/app/components/utils';
// include
import { vrmLoader } from './vrmLoader';
import {
  startBlinking,
  startBreathing,
  startSwaying,
  startRandomEyeMovementWithDice,
} from './animationFunctions';
// type
import type { VrmCoreProviderOptions } from './type.d'

// type
type VrmExpressionManagerLike = {
  _expressionMap?: Record<string, unknown>;
};
type VrmCoreProviderProps = {
  url:      string;
  children: ReactNode;
  options?: VrmCoreProviderOptions;
};
export type VrmCoreContextValue = {
  vrmRef:       MutableRefObject<VRM | null>;
  width:        number;
  height:       number;
  maxRatio:     number;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

// VrmCoreProvider ▽
export function VrmCoreProvider({url, children, options,}: VrmCoreProviderProps): ReactElement {
  const {
    // display
    width    = 500,
    height   = 600,
    maxRatio = 0.7,
    fps      = 15,
    // camera
    cameraFov  = 9.0,
    cameraNear = 0.1,
    cameraFar  = 10.0,
    cameraX    = 0,
    cameraY    = 1.15,
    cameraZ    = 3.0,
    // renderer
    rendererAlpha      = true,
    rendererAntialias  = false,
    rendererPixelRatio = 4 / 4,
    // light
    lightColor      = 0xffffff,
    lightIntensity  = 2.8,
    lightCastShadow = false,
  } = options || {};

  const containerRef = useRef<HTMLDivElement>(null);
  const vrmRef       = useRef<VRM | null>(null);
  const rendererRef  = useRef<WebGLRenderer | null>(null);
  const sceneRef     = useRef<Scene | null>(null);
  const cameraRef    = useRef<PerspectiveCamera | null>(null);

  // フレームレート制限
  const interval = 1000 / fps;
  const clock    = useMemo(() => new Clock(), []);

  // シーン・カメラ・レンダラー初期化
  const initScene = useCallback(() => {

    if (vrmRef.current) {
      if (vrmRef.current.scene) {
        VRMUtils.deepDispose(vrmRef.current.scene);
      };
      vrmRef.current = null;
    };
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    };
    if (sceneRef.current) {
      sceneRef.current.clear();
      sceneRef.current = null;
    };
    if (cameraRef.current) {
      cameraRef.current = null;
    };
    if (containerRef.current) {
      // DOMコンテナに残っている要素を除去
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      };
    };

    // Scene
    const scene      = new Scene();
    scene.background = null; // 背景を透明
    sceneRef.current = scene;

    // Camera
    const camera = new PerspectiveCamera(cameraFov, width/height, cameraNear, cameraFar); //（画角, アスペクト比, ニアークリップ, ファークリップ）
    camera.position.set(cameraX, cameraY, cameraZ);                                       // (x,y,z)
    cameraRef.current = camera;

    // Renderer
    const renderer = new WebGLRenderer({ alpha: rendererAlpha, antialias: rendererAntialias }); // 背景を透明に設定, アンチエイリアス無効化
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio * rendererPixelRatio);                       // PixelRatio調整
    rendererRef.current = renderer;

    // DOMへ追加
    containerRef.current?.appendChild(renderer.domElement);

    // light (AmbientLight)
    const light = new AmbientLight(lightColor, lightIntensity); // 環境光, 全体的な負荷を減らす
    light.castShadow = lightCastShadow;                         // 影の計算を無効化
    scene.add(light);
  }, [
    vrmRef,
    width,
    height,
    cameraFov,
    cameraNear,
    cameraFar,
    cameraX,
    cameraY,
    cameraZ,
    rendererAlpha,
    rendererAntialias,
    rendererPixelRatio,
    lightCastShadow,
    lightColor,
    lightIntensity,
  ]);

  // VRMを読み込み、シーンに追加
  const loadVRMModel = useCallback(async () => {
    
    await initScene();

    if (!sceneRef.current) return;

    try {
      vrmRef.current = await vrmLoader(url)

      // シーンへ追加
      sceneRef.current.add(vrmRef.current.scene);

      // 不要な頂点／ジョイントを削除（パフォーマンス向上）
      VRMUtils.removeUnnecessaryVertices(vrmRef.current.scene);
      VRMUtils.combineSkeletons(vrmRef.current.scene);

      // A字ポーズに変更
      vrmRef.current.humanoid?.getNormalizedBoneNode('leftUpperArm')?.rotation.set(0, 0, 1.5);
      vrmRef.current.humanoid?.getNormalizedBoneNode('rightUpperArm')?.rotation.set(0, 0, -1.5);
      vrmRef.current.humanoid?.update();
      // デフォルト表情
      vrmRef.current.expressionManager?.setValue('relaxed', 0.2);
      vrmRef.current.expressionManager?.update();

      // 瞬き,呼吸,左右動き,よそ見 アニメーションを開始
      startBlinking(vrmRef.current);
      startBreathing(vrmRef.current);
      startSwaying(vrmRef.current);
      startRandomEyeMovementWithDice(vrmRef.current);

      // DEBUG ▽
      // console.log('VRM loaded', vrmRef.current);
      // expressionManagerの確認
      if (vrmRef.current.expressionManager) {
          // すべての表情をコンソールに出力
          const em = vrmRef.current.expressionManager as unknown as VrmExpressionManagerLike;
          if (em._expressionMap && typeof em._expressionMap === 'object') {
            // console.log('Expression Manager Keys:');
            // console.log(Object.keys(em._expressionMap));
            // 詳細を表示する際には以下のコメントアウト解除
            // console.log('Expression Manager - All Expressions:');
            // for (const [key, expression] of Object.entries(em._expressionMap)) {
            //   console.log(`Expression Key: ${key}, Expression:`, expression);
            // };
          }
      } else {
          console.log('ExpressionManager is undefined.');
      };
      // DEBUG △
    } catch {
      showToast('error', 'Failed to load VRM', {position: 'bottom-right', duration: 3000});
    };
  }, [url]);

  // animate
  const animate = useCallback(() => {

    const renderer = rendererRef.current;
    const scene    = sceneRef.current;
    const camera   = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    let lastFrameTime = 0;
    function renderLoop(time: number) {
      requestAnimationFrame(renderLoop);
      if (time - lastFrameTime >= interval) {
        lastFrameTime = time;
        const delta = clock.getDelta();
        if (vrmRef.current) {
          vrmRef.current.update(delta);
        }
        renderer.render(scene, camera);
      };
    };
    requestAnimationFrame(renderLoop);
  }, [clock, vrmRef, interval]);

  // マウント時の初期処理
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    loadVRMModel().then(() => {
      animate(); // VRMのロード後にアニメーション開始
    });
    // Cleanup(アンマウント時)
    return () => {
      isMounted = false;
      if (vrmRef.current) {
        if (vrmRef.current.scene) {
          VRMUtils.deepDispose(vrmRef.current.scene);
        };
        vrmRef.current = null;
      };
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      };
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      };
      if (cameraRef.current) {
        cameraRef.current = null;
      };
      if (containerRef.current) {
        // DOMコンテナに残っている要素を除去
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        };
      };
    };
  }, [url, loadVRMModel]);

  // 画面リサイズ時の拡大縮小
  useEffect(() => {
    function onResize() {

      if (!rendererRef.current || !cameraRef.current || !containerRef.current) return;

      let newWidth    = width;
      let newHeight   = height;
      const maxWidth  = window.innerWidth  * maxRatio;
      const maxHeight = window.innerHeight * maxRatio;

      // 縦横のどちらかが指定率を超えたら比率を維持して縮小
      if (newWidth > maxWidth || newHeight > maxHeight) {
        const scaleW      = maxWidth  / newWidth;
        const scaleH      = maxHeight / newHeight;
        const scaleFactor = Math.min(scaleW, scaleH);

        newWidth  = newWidth  * scaleFactor;
        newHeight = newHeight * scaleFactor;

        // コンテナのスタイルを更新
        containerRef.current.style.width  = `${newWidth}px`;
        containerRef.current.style.height = `${newHeight}px`;
        // Three.js 側のサイズ & カメラ更新
        rendererRef.current.setSize(newWidth, newHeight);
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
      };
    };
    // リスナー登録
    window.addEventListener('resize', onResize);
    // 初期化
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [url, width, height, maxRatio]);

  const contextValue: VrmCoreContextValue = useMemo(() => ({
    vrmRef,
    width,
    height,
    maxRatio,
    containerRef,
  }), [vrmRef, width, height, maxRatio]);

  return (
    <VrmCoreContext.Provider value={contextValue}>
      {children}
    </VrmCoreContext.Provider>
  );
};
// VrmCoreProvider △

// VrmCoreContext
export const VrmCoreContext = createContext<VrmCoreContextValue | null>(null);