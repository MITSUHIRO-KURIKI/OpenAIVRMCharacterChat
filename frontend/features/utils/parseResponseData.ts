export function parseResponseData<T = any>(res: any): T[] {
  const raw = res?.data;
  // 配列ならそのまま
  if (Array.isArray(raw)) {
    return raw as T[];
  };
  // DRF 標準の pagination が有効なら raw.results が配列
  if (raw?.results && Array.isArray(raw.results)) {
    return raw.results as T[];
  };
  // 独自に {"data": [...]} を返す API の場合
  if (raw?.data && Array.isArray(raw.data)) {
    return raw.data as T[];
  };
  // 上記いずれにも該当しなければ空配列にしておく
  return [];
};