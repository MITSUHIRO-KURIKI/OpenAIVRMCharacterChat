import { NextResponse, type NextRequest } from 'next/server';
import { handleHttpRequest, handleSecurity, handleCors, handleSession, handleLocale } from '@/src/middlewares';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next();
  // ALLOWED_HOSTS検証
  response = handleHttpRequest(request, response);
  // Security関連
  response = handleSecurity(request, response);
  // CORS関連
  response = handleCors(request, response);
  // Session関連
  response = handleSession(request, response);
  // Locale関連
  response = handleLocale(request, response);
  return response;
};