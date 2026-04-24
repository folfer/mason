import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/news', '/profile', '/subscribe']
const adminRoutes = ['/admin']
// Only exact /login and /register — not subpaths like /register/quiz
const authRoutes = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read session token from cookie (Better Auth uses "better-auth.session_token")
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value

  const isAuthenticated = !!sessionToken

  // Redirect authenticated users away from login only (register may be needed to complete profile)
  if (isAuthenticated && pathname === '/login') {
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
