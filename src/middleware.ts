import { getToken } from "next-auth/jwt"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || []

  const response = NextResponse.next()

  // Handle dynamic CORS
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // Preflight request (OPTIONS)
  if (request.method === 'OPTIONS') {
    return response
  }

  // 🔐 Auth checks (same as you already have)
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  const publicPaths = [
    '/login',
    '/register',
    '/terms',
    '/privacy',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/api/health',
    '/_vercel',
    '/public',
    '/(main)',
    '/(main)/about',
    '/(main)/profile',
    '/(main)/billing',
    '/(main)/team',
    '/(main)/subscription'
  ]

  const isPublicPath = publicPaths.some(path => {
    if (path === '/_next') return pathname.startsWith('/_next')
    if (path === '/api/auth') return pathname.startsWith('/api/auth')
    return pathname === path || pathname.startsWith(`${path}/`)
  })

  if (isPublicPath) {
    return response
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const authPaths = ['/login', '/register']
  if (authPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(new URL('/(main)', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
