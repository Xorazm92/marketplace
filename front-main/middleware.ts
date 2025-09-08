import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if the current path starts with /admin
  const isAdminPath = path.startsWith('/admin');
  
  // Get the token from cookies
  const token = request.cookies.get('admin-token')?.value;
  
  // If it's the login page and the user is already authenticated, redirect to dashboard
  if (path === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // If it's an admin path but not the login page and no token, redirect to login
  if (isAdminPath && path !== '/admin/login' && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
