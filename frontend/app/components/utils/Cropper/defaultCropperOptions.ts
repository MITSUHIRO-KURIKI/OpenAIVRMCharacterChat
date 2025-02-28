import type { ReactCropperProps } from 'react-cropper';

export const defaultCropperOptions: Partial<ReactCropperProps> = {
  // ------- 画像情報 -------
  checkCrossOrigin: false,         // 画像のクロスオリジンを確認
  checkOrientation: false,         // 画像の Exif 方向情報を確認
  // ------- モード -------
  viewMode: 1,                     // https://github.com/fengyuanchen/cropperjs?tab=readme-ov-file#viewmode
  dragMode: 'crop',                // https://github.com/fengyuanchen/cropperjs?tab=readme-ov-file#dragmode
  toggleDragModeOnDblclick: false, // ダブルクリックで dragMode の "crop" and "move" 切り替えを許可
  // 切り抜きのアスペクト
  initialAspectRatio: 1.0,         // 初期アスペクト比
  aspectRatio:        1.0,         // アスペクト比 (比率を固定しない場合は null 指定)
  // レスポンシブ
  responsive: true,                // レスポンシブル対応
  restore:    true,                // レスポンシブル時に領域を復元
  // ガイド
  guides:     true,                // ガイドの表示
  center:     true,                // センターガイドの表示
  highlight:  true,                // 切り抜き領域のハイライト
  background: true,                // コンテナの背景を表示
  // 初期状態
  autoCropArea: 1.0,               // キャンバスに対する初期の切り抜き範囲の比率
  // 画像操作
  movable:   true,                 // 画像の移動を許可
  rotatable: true,                 // 画像の回転を許可
  scalable:  true,                 // 画像の拡大縮小を許可
  zoomable:  true,                 // 画像のズームを許可
  // ズーム操作
  zoomOnTouch:    true,            // タッチドラッグのズームを許可
  zoomOnWheel:    true,            // スクロールのズームを許可
  wheelZoomRatio: 0.05,            // スクロールでのズームの量
  // cropBox
  cropBoxMovable:   true,          // ドラッグによる切り抜きエリア移動を許可
  cropBoxResizable: true,          // ドラッグによる切り抜きエリア移動のリサイズを許可
};