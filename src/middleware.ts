import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // List of valid routes
  const validRoutes = [
    '/',
    '/c',
    '/c/[chatId]',
    // Add other valid routes here
  ];

  // Check if the current path is not in the valid routes
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
    return path === route || path.startsWith(route + '/');
  });

  if (!isValidRoute) {
    // Redirect to home for any other route
    return NextResponse.redirect(new URL('/', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
