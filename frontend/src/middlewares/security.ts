import { NextResponse, type NextRequest } from 'next/server';

export function handleSecurity(request: NextRequest, response: NextResponse): NextResponse {
  const IS_SECURE_SSL_REDIRECT            = process.env.SECURE_SSL_REDIRECT === 'true';
  const IS_SECURE_HSTS_SECONDS            = process.env.SECURE_HSTS_SECONDS === 'true';
  const IS_SECURE_HSTS_INCLUDE_SUBDOMAINS = process.env.SECURE_HSTS_INCLUDE_SUBDOMAINS === 'true';
  const IS_SECURE_HSTS_PRELOAD            = process.env.SECURE_HSTS_PRELOAD === 'true';
  const X_FRAME_OPTIONS                   = process.env.X_FRAME_OPTIONS?.trim() || false;
  const IS_SECURE_CONTENT_TYPE_NOSNIFF    = process.env.SECURE_CONTENT_TYPE_NOSNIFF === 'true';
  const IS_SECURE_BROWSER_XSS_FILTER      = process.env.SECURE_BROWSER_XSS_FILTER === 'true';
  const REFERRER_POLICY                   = process.env.REFERRER_POLICY?.trim() || false;
  const CROSS_ORIGIN_RESOURCE_POLICY      = process.env.CROSS_ORIGIN_RESOURCE_POLICY?.trim() || false;

  // HTTP → HTTPS リダイレクト
  const url = request.nextUrl;
  if (IS_SECURE_SSL_REDIRECT && url.protocol === 'http:') {
      url.protocol = 'https:';
      return NextResponse.redirect(url);
  };
  // セキュリティヘッダー設定(本番時にはドメインで HTTPS しかブラウザが受け付けなくなるので設定時注意)
  if (IS_SECURE_HSTS_SECONDS) {
    let hstsValue = `max-age=31536000`;
    if (IS_SECURE_HSTS_INCLUDE_SUBDOMAINS) { hstsValue += `; includeSubDomains`; };
    if (IS_SECURE_HSTS_PRELOAD)            { hstsValue += `; preload`; };
    response.headers.set('Strict-Transport-Security', hstsValue);
  };
  if (X_FRAME_OPTIONS)                { response.headers.set('X-Frame-Options',        X_FRAME_OPTIONS); };
  if (IS_SECURE_CONTENT_TYPE_NOSNIFF) { response.headers.set('X-Content-Type-Options', 'nosniff'); };
  if (IS_SECURE_BROWSER_XSS_FILTER)   { response.headers.set('X-XSS-Protection',       '1; mode=block'); };
  if (REFERRER_POLICY)                { response.headers.set('Referrer-Policy',        REFERRER_POLICY); };
  if (CROSS_ORIGIN_RESOURCE_POLICY)   { response.headers.set('Cross-Origin-Resource-Policy', CROSS_ORIGIN_RESOURCE_POLICY); };

  return response;
};