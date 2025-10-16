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
    '/api/health'
  ]
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`) || 
    pathname.startsWith('/_next/')
  )

  // If it's a public path, continue
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For API routes, return 401 if not authenticated
  if (pathname.startsWith('/api/') && !token) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  // For non-API routes, redirect to login if not authenticated
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
