import type { Context, Next } from 'hono'
import { verifyAccessToken } from '../jwt.js'
import type { Env } from '../env.js'

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const env = c.get('env') as Env
  try {
    const userId = await verifyAccessToken(token, env)
    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
