export type VrmCoreProviderOptions = {
  // display
  width?:    number;
  height?:   number;
  maxRatio?: number;
  fps?:      number;
  // camera
  cameraFov?:  number;
  cameraNear?: number;
  cameraFar?:  number;
  cameraX?:    number;
  cameraY?:    number;
  cameraZ?:    number;
  // renderer
  rendererAlpha?:      boolean;
  rendererAntialias?:  boolean;
  rendererPixelRatio?: number;
  // light
  lightColor?:      number;
  lightIntensity?:  number;
  lightCastShadow?: boolean;
};