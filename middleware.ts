import { getToken } from "next-auth/jwt"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicPaths = [
    '/login', 
    '/register',
    '/api/auth',
    '/_next', 
    '/favicon.ico',
    '/api/health',
    '/_vercel',
    '/public',
    '/(main)',
    '/(main)/profile',
    '/(main)/billing',
    '/(main)/team',
    '/(main)/subscription'
  ]
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => {
    if (path === '/_next') {
      return pathname.startsWith('/_next')
    }
    if (path === '/api/auth') {
      return pathname.startsWith('/api/auth')
    }
    return pathname === path || pathname.startsWith(`${path}/`)
  })

  // If it's a public path, continue
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Handle auth redirects for protected routes
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register']
  if (authPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(new URL('/(main)', request.url))
  }

  // Allow all other routes if authenticated
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
