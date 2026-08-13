import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminJwtSecret } from '@/lib/admin-session';
import { isAppLocale } from '@/i18n/routing';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split('/').filter(Boolean)[0];
  if (isAppLocale(locale)) {
    const headers = new Headers(request.headers);
    headers.set('x-ist-locale', locale);
    return NextResponse.next({ request: { headers } });
  }

  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    const login = new URL('/admin/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, adminJwtSecret());
    if (payload.role === 'admin' && typeof payload.username === 'string') {
      return NextResponse.next();
    }
  } catch (error) {
    if (
      process.env.NODE_ENV === 'production' &&
      error instanceof Error &&
      error.message.includes('ADMIN_JWT_SECRET')
    ) {
      return new NextResponse('Admin is unavailable because authentication is not configured.', {
        status: 503,
      });
    }
  }

  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/:locale(en|ar|ur|ps|fa-AF|fr)/:path*'],
};
