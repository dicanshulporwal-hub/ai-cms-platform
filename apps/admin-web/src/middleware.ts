import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth-cookie';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/pages') ||
      pathname.startsWith('/blogs') ||
      pathname.startsWith('/workflow') ||
      pathname.startsWith('/ai') ||
      pathname.startsWith('/chatbot') ||
      pathname.startsWith('/notifications') ||
      pathname.startsWith('/media') ||
      pathname.startsWith('/documents') ||
      pathname.startsWith('/categories') ||
      pathname.startsWith('/tags') ||
      pathname.startsWith('/users') ||
      pathname.startsWith('/roles') ||
      pathname.startsWith('/templates') ||
      pathname.startsWith('/modules') ||
      pathname.startsWith('/settings')) &&
    !token
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pages/:path*',
    '/blogs/:path*',
    '/workflow/:path*',
    '/ai/:path*',
    '/chatbot/:path*',
    '/notifications/:path*',
    '/media/:path*',
    '/documents/:path*',
    '/categories/:path*',
    '/tags/:path*',
    '/users/:path*',
    '/roles/:path*',
    '/templates/:path*',
    '/modules/:path*',
    '/settings/:path*',
    '/login',
  ],
};
