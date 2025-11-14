import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'pikl-qa-auth';
const AUTH_TOKEN = 'authenticated-pikl-2025';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page, auth API, and admin API (admin has its own auth)
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Allow access to static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie || authCookie.value !== AUTH_TOKEN) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
