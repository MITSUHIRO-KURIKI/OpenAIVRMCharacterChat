import { NextResponse, type NextRequest } from 'next/server';

export function handleLocale(request: NextRequest, response: NextResponse): NextResponse {
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const locale = acceptLanguage.split(',')[0];
    response.headers.set('Content-Language', locale);
  };
  return response;
};