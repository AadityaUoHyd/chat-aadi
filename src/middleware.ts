// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({ req: request });
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/api/health'
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    path === route || 
    path.startsWith(`${route}/`) || 
    path.startsWith('/_next/')
  );

  // Allow public routes to pass through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Handle API routes
  if (path.startsWith('/api/')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Valid application routes
  const validRoutes = [
    '/',
    '/c',
    '/c/[chatId]',
  ];

  // Check if the current path is a valid route
  const isValidRoute = validRoutes.some(route => {
    if (route.includes('[')) {
      // Handle dynamic routes like /c/[chatId]
      const routeParts = route.split('/');
      const pathParts = path.split('/');
      
      if (routeParts.length !== pathParts.length) return false;
      
      return routeParts.every((part, index) => {
        return part.startsWith('[') || part === pathParts[index];
      });
    }
    return path === route;
  });

  // Redirect to home if route is not valid
  if (!isValidRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};