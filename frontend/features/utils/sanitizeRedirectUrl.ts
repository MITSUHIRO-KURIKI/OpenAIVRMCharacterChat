export function sanitizeRedirectUrl(url: string | null | undefined): string | undefined {
  
  if (!url) return undefined;
  
  const trimmed = url.trim();

  // '/' から始まっていない、'http://', 'https://' を含む場合拒否
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || /^https?:\/\//i.test(trimmed)) {
    return '/';
  };

  return trimmed;
};