import { NextRequest, NextResponse } from 'next/server';
import { isLocale } from '@viraplaza/shared';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const localeParam = request.nextUrl.searchParams.get('lang');
  if (localeParam && isLocale(localeParam)) {
    response.cookies.set('NEXT_LOCALE', localeParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
