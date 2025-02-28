// Ref:
//  - https://pixiv.github.io/three-vrm/packages/three-vrm/docs/index.html
//  - https://github.com/pixiv/three-vrm/blob/dev/docs/migration-guide-1.0.md
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
} from '@pixiv/three-vrm';

type VrmLoaderOptions = {
  crossOrigin?: string;
};

export async function vrmLoader(
  url: string,
  { crossOrigin='anonymous' }: VrmLoaderOptions={},): Promise<VRM> {
  // GLTFLoader
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.crossOrigin = crossOrigin;
  const gltf         = await loader.loadAsync(url);
  const vrm          = gltf.userData.vrm as VRM;
  // VRM0.0なら回転を補正
  //  - VRM0.0 -> -Z 向き, VRM1.0 -> +Z 向き
  VRMUtils.rotateVRM0(vrm);
  return vrm;
};