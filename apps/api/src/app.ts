import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { and, eq, isNull } from 'drizzle-orm'
import {
  goodsItems,
  permissions,
  rolePermissions,
  roles,
  stockLocations,
  stockMovements,
  tenantMembers,
  tenants,
  userRoles,
  users,
} from '@repo/db'
import {
  goodsItemCreateSchema,
  goodsItemUpdateSchema,
  loginSchema,
  PERMISSIONS,
  refreshSchema,
  registerSchema,
  stockLocationCreateSchema,
  stockLocationUpdateSchema,
  stockMovementCreateSchema,
} from '@repo/contracts'
import type { Env } from './env.js'
import type { createLogger } from './logger.js'
import type { createAppDb } from './db.js'
import { hashPassword, verifyPassword } from './password.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js'
import { authMiddleware } from './middleware/auth.js'
import { tenantMiddleware } from './middleware/tenant.js'
import { withTenantTx } from './tenantTx.js'
import { listUserPermissionCodes, requirePermission } from './permissions.js'

type Variables = {
  env: Env
  logger: ReturnType<typeof createLogger>
  db: ReturnType<typeof createAppDb>
  userId?: string
  tenantId?: string
  permissionCodes?: Set<string>
}

export function createApp(env: Env, logger: ReturnType<typeof createLogger>, db: ReturnType<typeof createAppDb>) {
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', async (c, next) => {
    c.set('env', env)
    c.set('logger', logger)
    c.set('db', db)
    await next()
  })

  app.use(
    '*',
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      allowHeaders: ['Authorization', 'Content-Type', 'X-Tenant-Id'],
      exposeHeaders: ['Content-Type'],
      credentials: true,
    }),
  )

  app.get('/health', (c) => c.json({ ok: true }))

  app.post('/auth/register', async (c) => {
    const body = registerSchema.safeParse(await c.req.json())
    if (!body.success) return c.json({ error: body.error.flatten() }, 400)
    const { email, password, fullName, tenantName } = body.data
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length) return c.json({ error: 'Email already registered' }, 409)

    const passwordHash = await hashPassword(password)
    const [userRow] = await db.insert(users).values({ email, passwordHash, fullName }).returning()
    const [tenantRow] = await db.insert(tenants).values({ name: tenantName }).returning()
    if (!userRow || !tenantRow) return c.json({ error: 'Registration failed' }, 500)

    await db
      .insert(tenantMembers)
      .values({ tenantId: tenantRow.id, userId: userRow.id, status: 'active' })

    const [ownerRole] = await db
      .insert(roles)
      .values({ tenantId: tenantRow.id, name: 'Owner', slug: 'owner' })
      .returning()
    if (!ownerRole) return c.json({ error: 'Registration failed' }, 500)

    const permRows = await db.select().from(permissions)
    if (permRows.length === 0) {
      logger.warn('No permissions in DB — run pnpm db:seed before register')
    }
    for (const p of permRows) {
      await db.insert(rolePermissions).values({ roleId: ownerRole.id, permissionId: p.id })
    }
    await db.insert(userRoles).values({
      tenantId: tenantRow.id,
      userId: userRow.id,
      roleId: ownerRole.id,
    })

    const accessToken = await signAccessToken(userRow.id, env)
    const refreshToken = await signRefreshToken(userRow.id, env)
    return c.json({
      accessToken,
      refreshToken,
      user: { id: userRow.id, email: userRow.email, fullName: userRow.fullName },
      tenant: { id: tenantRow.id, name: tenantRow.name },
    })
  })

  app.post('/auth/login', async (c) => {
    const body = loginSchema.safeParse(await c.req.json())
    if (!body.success) return c.json({ error: body.error.flatten() }, 400)
    const { email, password } = body.data
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) return c.json({ error: 'Invalid credentials' }, 401)
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return c.json({ error: 'Invalid credentials' }, 401)
    const accessToken = await signAccessToken(user.id, env)
    const refreshToken = await signRefreshToken(user.id, env)
    return c.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName } })
  })

  app.post('/auth/refresh', async (c) => {
    const body = refreshSchema.safeParse(await c.req.json())
    if (!body.success) return c.json({ error: body.error.flatten() }, 400)
    try {
      const userId = await verifyRefreshToken(body.data.refreshToken, env)
      const accessToken = await signAccessToken(userId, env)
      const refreshToken = await signRefreshToken(userId, env)
      return c.json({ accessToken, refreshToken })
    } catch {
      return c.json({ error: 'Invalid refresh token' }, 401)
    }
  })

  app.get('/me', authMiddleware, async (c) => {
    const userId = c.get('userId')!
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) return c.json({ error: 'Not found' }, 404)
    const memberships = await db
      .select({ tenantId: tenantMembers.tenantId, tenantName: tenants.name, status: tenantMembers.status })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
      .where(eq(tenantMembers.userId, userId))

    const tenantHeader = c.req.header('x-tenant-id')
    let permissionCodes: string[] = []
    if (tenantHeader) {
      permissionCodes = [...(await listUserPermissionCodes(db, userId, tenantHeader))]
    }
    return c.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      tenants: memberships,
      permissionCodes,
    })
  })

  app.get('/goods-items', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.GOODS_READ)) return c.json({ error: 'Forbidden' }, 403)
    const tenantId = c.get('tenantId')!
    const rows = await withTenantTx(db, tenantId, (tx) =>
      tx.select().from(goodsItems).where(isNull(goodsItems.deletedAt)),
    )
    return c.json({ items: rows })
  })

  app.post('/goods-items', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.GOODS_WRITE)) return c.json({ error: 'Forbidden' }, 403)
    const parsed = goodsItemCreateSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const [row] = await withTenantTx(db, tenantId, (tx) =>
      tx
        .insert(goodsItems)
        .values({
          tenantId,
          sku: parsed.data.sku,
          name: parsed.data.name,
          unit: parsed.data.unit,
          metadata: parsed.data.metadata,
          createdById: userId,
          updatedById: userId,
        })
        .returning(),
    )
    return c.json(row)
  })

  app.patch('/goods-items/:id', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.GOODS_WRITE)) return c.json({ error: 'Forbidden' }, 403)
    const parsed = goodsItemUpdateSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Missing id' }, 400)
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const [row] = await withTenantTx(db, tenantId, (tx) =>
      tx
        .update(goodsItems)
        .set({ ...parsed.data, updatedById: userId, updatedAt: new Date() })
        .where(and(eq(goodsItems.id, id), eq(goodsItems.tenantId, tenantId)))
        .returning(),
    )
    if (!row) return c.json({ error: 'Not found' }, 404)
    return c.json(row)
  })

  app.delete('/goods-items/:id', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.GOODS_WRITE)) return c.json({ error: 'Forbidden' }, 403)
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Missing id' }, 400)
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const [row] = await withTenantTx(db, tenantId, (tx) =>
      tx
        .update(goodsItems)
        .set({ deletedAt: new Date(), updatedById: userId, updatedAt: new Date() })
        .where(and(eq(goodsItems.id, id), eq(goodsItems.tenantId, tenantId)))
        .returning(),
    )
    if (!row) return c.json({ error: 'Not found' }, 404)
    return c.json({ ok: true })
  })

  app.get('/stock-locations', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.LOCATIONS_READ)) return c.json({ error: 'Forbidden' }, 403)
    const tenantId = c.get('tenantId')!
    const rows = await withTenantTx(db, tenantId, (tx) =>
      tx.select().from(stockLocations).where(isNull(stockLocations.deletedAt)),
    )
    return c.json({ items: rows })
  })

  app.post('/stock-locations', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.LOCATIONS_WRITE)) return c.json({ error: 'Forbidden' }, 403)
    const parsed = stockLocationCreateSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const [row] = await withTenantTx(db, tenantId, (tx) =>
      tx
        .insert(stockLocations)
        .values({
          tenantId,
          name: parsed.data.name,
          code: parsed.data.code,
          createdById: userId,
          updatedById: userId,
        })
        .returning(),
    )
    return c.json(row)
  })

  app.patch('/stock-locations/:id', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.LOCATIONS_WRITE)) return c.json({ error: 'Forbidden' }, 403)
    const parsed = stockLocationUpdateSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Missing id' }, 400)
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const [row] = await withTenantTx(db, tenantId, (tx) =>
      tx
        .update(stockLocations)
        .set({ ...parsed.data, updatedById: userId, updatedAt: new Date() })
        .where(and(eq(stockLocations.id, id), eq(stockLocations.tenantId, tenantId)))
        .returning(),
    )
    if (!row) return c.json({ error: 'Not found' }, 404)
    return c.json(row)
  })

  app.get('/stock-movements', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.MOVEMENTS_READ)) return c.json({ error: 'Forbidden' }, 403)
    const tenantId = c.get('tenantId')!
    const rows = await withTenantTx(db, tenantId, (tx) =>
      tx.select().from(stockMovements).where(isNull(stockMovements.deletedAt)).limit(200),
    )
    return c.json({ items: rows })
  })

  app.post('/stock-movements', authMiddleware, tenantMiddleware, async (c) => {
    const codes = c.get('permissionCodes')!
    if (!requirePermission(codes, PERMISSIONS.MOVEMENTS_WRITE)) return c.json({ error: 'Forbidden' }, 403)
    const parsed = stockMovementCreateSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const [row] = await withTenantTx(db, tenantId, (tx) =>
      tx
        .insert(stockMovements)
        .values({
          tenantId,
          goodsItemId: parsed.data.goodsItemId,
          stockLocationId: parsed.data.stockLocationId,
          quantityDelta: parsed.data.quantityDelta,
          reason: parsed.data.reason,
          reference: parsed.data.reference,
          createdById: userId,
          updatedById: userId,
        })
        .returning(),
    )
    return c.json(row)
  })

  return app
}
