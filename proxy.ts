import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/news', '/profile', '/subscribe']
const adminRoutes = ['/admin']
// Only exact /login and /register — not subpaths like /register/quiz
const authRoutes = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Better Auth prefixes the cookie with "__Secure-" when the configured base URL
  // uses HTTPS, so accept either name.
  const sessionToken =
    request.cookies.get('__Secure-better-auth.session_token')?.value ??
    request.cookies.get('better-auth.session_token')?.value

  const isAuthenticated = !!sessionToken

  // Logged-in users see /news as their home, not the marketing landing or login.
  // Register is left alone — onboarding may need it after signup.
  if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/news', request.url))
  }

  // Protect /news, /profile, /subscribe
  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect /admin
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Role check happens in the server components (DB query needed)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
