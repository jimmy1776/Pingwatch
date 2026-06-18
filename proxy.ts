import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

  const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/invite', '/api/invites', '/api/stripe/webhook']

  export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
    const session = await getSession()

    if (!isPublic && !session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  }

  export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  }

/*
  The logic:
  - If the route is not public and there's no session → redirect to /login
  - If there's a session and they're trying to hit /login or /register → redirect to /dashboard (no
  point going back to login if already authenticated)
  - Otherwise, let the request throug
*/ 







