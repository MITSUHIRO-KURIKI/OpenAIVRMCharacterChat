import { NextResponse, type NextRequest } from 'next/server';

export function handleSession(request: NextRequest, response: NextResponse): NextResponse {
  // const IS_COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
  // let sessionId          = request.cookies.get('sessionid')?.value;

  // if (!sessionId) {
  //   sessionId = crypto.randomUUID();
  //   response.cookies.set('sessionid', sessionId, {
  //     httpOnly: true,
  //     secure:   IS_COOKIE_SECURE,
  //     path:     '/',
  //     sameSite: 'lax',
  //   });
  // };
  return response;
};