import { NextResponse, type NextRequest } from 'next/server';

export function handleHttpRequest(request: NextRequest, response: NextResponse): NextResponse {
  const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || '').split(',').map(host => host.trim());
  const host          = request.headers.get('host');

  if (!host || !ALLOWED_HOSTS.includes(host)) {
    return new NextResponse('Bad Request', { status: 400 });
  };
  return response;
};