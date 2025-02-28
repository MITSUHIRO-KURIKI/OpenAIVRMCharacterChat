// Ref: https://github.com/nextauthjs/next-auth/issues/717

// next
import { NextRequest, NextResponse } from 'next/server';
// crypto
import { createHash } from 'crypto';


const CSRF_COOKIE_NAME = 'next-auth.csrf-token';
const TOKEN_DELIMITERS = ['|', '%7C'] as const;

// extractCsrfCookieValueFromHeader
// ヘッダーの文字列から next-auth.csrf-token を含む value(xxxx|yyyy or xxxx%7Cyyyy) を取得
function extractCsrfCookieValueFromHeader(rawCookieString: string | null): string | null {
  if (!rawCookieString) return null;

  const rawCookiesArr: string[]        = rawCookieString.split(';');
  const csrfCookie: string | undefined = rawCookiesArr.find(
    (cookie) => cookie.trim().startsWith(CSRF_COOKIE_NAME)
  );

  if (!csrfCookie) return null;

  const [, value] = csrfCookie.split('=');
  if (!value) return null;

  return value;
};
// extractCsrfCookieValueFromAllCookies
// allCookies から next-auth.csrf-token を含む value(xxxx|yyyy or xxxx%7Cyyyy) を取得
function extractCsrfCookieValueFromAllCookies(allCookies: Array<{ name: string; value: string }>): string | null {
  for (const cookieObj of allCookies) {
    if (cookieObj.name.includes(CSRF_COOKIE_NAME)) {
      return cookieObj.value;
    };
  };
  return null;
};

// parseTokenAndHash
// value(xxxx|yyyy or xxxx%7Cyyyy) を Token と ハッシュ値 に分離
function parseTokenAndHash(cookieValue: string): [string, string] | null {
  for (const delimiter of TOKEN_DELIMITERS) {
    if (cookieValue.includes(delimiter)) {
      const [token, hash] = cookieValue.split(delimiter);
      return [token, hash];
    };
  };
  return null;
};

// validateCsrfTokenHash
// 元のトークンをハッシュ値に変換して、変換前と一致することを確認
function validateCsrfTokenHash(token: string, secret: string, requestHash: string): boolean {
  const validHash: string = createHash('sha256').update(`${token}${secret}`).digest('hex');
  return requestHash === validHash;
};

// csrfValidator
// value(xxxx|yyyy or xxxx%7Cyyyy) から検証結果までのラッパー
function csrfValidator(csrfCookieValue: string, comparisonToken?: string): boolean {
  try{
    // 1. 境界文字('|' or a '%7C')を特定してトークンとハッシュ値に分離
    const tokenAndHash: [string, string] | null = parseTokenAndHash(csrfCookieValue);
    if (!tokenAndHash) {
      return false;
    };
    const [requestToken, requestHash] = tokenAndHash;

    // * 比較対象がある場合には一致確認
    if (comparisonToken && comparisonToken !== requestToken) {
        return false;
    };

    // 2. トークンをハッシュ化して元の値との一致を確認
    const secret: string | undefined = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      // no secret
      return false;
    };
    const isValid: boolean = validateCsrfTokenHash(requestToken, secret, requestHash);
    if (!isValid) {
      return false;
    };

    // 4. SUCSESS!
    return true;
  } catch (error: unknown) {
    // error
    return false;
  };
};
// csrfValidator △

// csrfValidatorForRequest
// request から利用するバリデーター
export function csrfValidatorForRequest(request: NextRequest): NextResponse {
  try {
    // ヘッダーに cookie があるか確認
    const cookieHeader: string | null = request.headers.get('cookie');
    if (!cookieHeader) {
      return new NextResponse(null, { status: 403 });
    };

    // next-auth.csrf-token の文字列取得 ("xxxx|yyyy" or "xxxx%7Cyyyy")
    const csrfCookieValue: string | null = extractCsrfCookieValueFromHeader(cookieHeader);
    if (!csrfCookieValue) {
      return new NextResponse(null, { status: 403 });
    };

    // 検証
    const isValid = csrfValidator(csrfCookieValue);
    if (!isValid) {
      return new NextResponse(null, { status: 403 });
    };

    // SUCSESS
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 403 });
  };
};

// csrfValidatorForCookie
// cookieStore.getAll() から利用するバリデーター
export function csrfValidatorForCookie(
  allCookies:       Array<{ name: string; value: string }>,
  comparisonToken?: string,
): NextResponse {
  try {

    // next-auth.csrf-token の文字列取得 ("xxxx|yyyy" or "xxxx%7Cyyyy")
    const csrfCookieValue: string | null = extractCsrfCookieValueFromAllCookies(allCookies);
    if (!csrfCookieValue) {
      return new NextResponse(null, { status: 403 });
    };

    // 検証
    const isValid = csrfValidator(csrfCookieValue, comparisonToken);
    if (!isValid) {
      return new NextResponse(null, { status: 403 });
    };

    // SUCSESS
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 403 });
  };
};