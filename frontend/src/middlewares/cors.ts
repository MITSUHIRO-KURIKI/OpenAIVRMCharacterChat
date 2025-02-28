import { NextResponse, type NextRequest } from 'next/server';

export function handleCors(request: NextRequest, response: NextResponse): NextResponse {
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()); // カンマ区切りで許可するオリジンを定義
  const origin          = request.headers.get('origin') || request.nextUrl.origin || '';

  if (ALLOWED_ORIGINS.includes(origin || '')) {
    response.headers.set('Access-Control-Allow-Origin',      origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods',     'GET,POST,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers',     'Content-Type, Authorization');
    response.headers.set('Cross-Origin-Opener-Policy',       'same-origin');
    return response;
  } else {
    return NextResponse.json(
      { error:  'CORS policy violation' },
      { status: 403 }
    );
  };
};