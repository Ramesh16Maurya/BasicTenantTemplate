import { NextResponse } from 'next/server'
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_TENANT, cookieOpts } from '@/lib/cookies'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_ACCESS, '', { ...cookieOpts, maxAge: 0 })
  res.cookies.set(COOKIE_REFRESH, '', { ...cookieOpts, maxAge: 0 })
  res.cookies.set(COOKIE_TENANT, '', { ...cookieOpts, httpOnly: false, maxAge: 0 })
  return res
}
