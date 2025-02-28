import DOMPurify from 'isomorphic-dompurify';

export function sanitizeDOMPurify(input: string | unknown): string {
  const inputStr = String(input)
  return DOMPurify.sanitize(
    inputStr,
    {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }
  );
};