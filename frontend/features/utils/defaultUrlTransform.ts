export function defaultUrlTransform(url: string): string {
    
  const allowedDomainsList = ['go.jp', 'or.jp', 'google.com',];
  const removeNonAscii     = (str: string) => str.replace(/[^\x00-\x7F]+/g, '');

  try {
    // ページ内アンカー (注釈など) ならそのまま許可
    if (url.startsWith('#')) return url;

    const parsed = new URL(url);

    // http/https 以外のスキームをブロック (mailto等含む)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#';
    };

    // http → https に変換
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    };

    // 特定ドメイン以外は無効化
    const isAllowed = allowedDomainsList.some((allowed) => {
      return (
        parsed.hostname === allowed ||
        parsed.hostname.endsWith('.' + allowed)
      );
    });
    if (!isAllowed) {
      return '#';
    };

    // pathname, search, hash をASCII文字だけにする
    parsed.pathname = removeNonAscii(parsed.pathname);
    parsed.search   = removeNonAscii(parsed.search);
    parsed.hash     = removeNonAscii(parsed.hash);
    return parsed.toString();
  } catch {
    return '#';
  };
};