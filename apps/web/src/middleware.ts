import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_ACCESS } from '@/lib/cookies'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/api')) {
    return NextResponse.next()
  }
  const token = req.cookies.get(COOKIE_ACCESS)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/goods/:path*', '/locations/:path*', '/movements/:path*'],
}
