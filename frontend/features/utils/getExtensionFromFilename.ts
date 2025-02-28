/** ファイル名から拡張子( .png など)を抽出 / fallback: .png */
export function getExtensionFromFilename(filename: string): string {
  const match = /\.\w+$/.exec(filename);
  if (match) return match[0];
  return '.png';
};