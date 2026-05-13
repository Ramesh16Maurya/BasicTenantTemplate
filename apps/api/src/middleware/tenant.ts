import type { Context, Next } from 'hono'
import { and, eq } from 'drizzle-orm'
import { tenantMembers } from '@repo/db'
import type { Env } from '../env.js'
import { listUserPermissionCodes } from '../permissions.js'

export async function tenantMiddleware(c: Context, next: Next) {
  const tenantId = c.req.header('x-tenant-id')
  if (!tenantId) {
    return c.json({ error: 'Missing X-Tenant-Id header' }, 400)
  }
  const userId = c.get('userId') as string
  const db = c.get('db')
  const member = await db
    .select()
    .from(tenantMembers)
    .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)))
    .limit(1)
  if (member.length === 0 || member[0].status !== 'active') {
    return c.json({ error: 'Forbidden for tenant' }, 403)
  }
  const perms = await listUserPermissionCodes(db, userId, tenantId)
  c.set('tenantId', tenantId)
  c.set('permissionCodes', perms)
  await next()
}
