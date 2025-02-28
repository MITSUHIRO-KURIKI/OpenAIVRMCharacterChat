export function getCookie(keyName: string): string {
  if (typeof document === 'undefined') return '';
  if (!keyName) return '';
  const match = document.cookie.match(new RegExp('(^| )' + keyName + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
};