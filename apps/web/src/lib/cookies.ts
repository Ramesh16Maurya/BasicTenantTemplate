export const COOKIE_ACCESS = 'gt_access'
export const COOKIE_REFRESH = 'gt_refresh'
export const COOKIE_TENANT = 'gt_tenant'

export const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}
