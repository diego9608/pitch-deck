import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@pd/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected investor routes that require deck_session cookie
  const investorRoutes = ['/deck', '/summary', '/hub'];
  const isInvestorRoute = investorRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isInvestorRoute) {
    const cookieSecret = process.env.COOKIE_SECRET;
    const sessionCookie = request.cookies.get('deck_session')?.value;

    if (!cookieSecret || !sessionCookie) {
      // Redirect to invite page
      return NextResponse.redirect(new URL('/invite/demo', request.url));
    }

    // Verify session signature and expiration
    const sessionData = verifySession(sessionCookie, cookieSecret);

    if (!sessionData) {
      // Session invalid or expired - redirect to invite
      const response = NextResponse.redirect(new URL('/invite/demo', request.url));
      response.cookies.delete('deck_session');
      return response;
    }

    // Session valid - allow access
    return NextResponse.next();
  }

  // Product routes (future: require user auth)
  const productRoutes = ['/w/'];
  const isProductRoute = productRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProductRoute) {
    // For now, stub this - will implement with Clerk/Supabase Auth
    // When ENABLE_SIGNUP=true, check user session here
    if (process.env.ENABLE_SIGNUP === 'false') {
      // Single-user mode - allow access for now
      return NextResponse.next();
    }

    // Check for user auth session here when enabled
    // For now, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/deck/:path*',
    '/summary',
    '/hub',
    '/w/:path*',
  ],
};
