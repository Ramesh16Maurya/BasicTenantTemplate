import { z } from 'zod'

/** API + UI permission keys — keep in sync with DB seed */
export const PERMISSIONS = {
  NAV_DASHBOARD: 'nav.dashboard',
  NAV_GOODS: 'nav.goods',
  NAV_LOCATIONS: 'nav.locations',
  NAV_MOVEMENTS: 'nav.movements',
  GOODS_READ: 'goods.read',
  GOODS_WRITE: 'goods.write',
  LOCATIONS_READ: 'locations.read',
  LOCATIONS_WRITE: 'locations.write',
  MOVEMENTS_READ: 'movements.read',
  MOVEMENTS_WRITE: 'movements.write',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const NAV_ROUTE_PERMISSION: Record<string, PermissionCode> = {
  '/': PERMISSIONS.NAV_DASHBOARD,
  '/goods': PERMISSIONS.NAV_GOODS,
  '/locations': PERMISSIONS.NAV_LOCATIONS,
  '/movements': PERMISSIONS.NAV_MOVEMENTS,
}

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(200),
  tenantName: z.string().min(1).max(200),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const goodsItemCreateSchema = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(500),
  unit: z.string().min(1).max(32).optional().default('ea'),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const goodsItemUpdateSchema = goodsItemCreateSchema.partial()

export const stockLocationCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(64).optional(),
})

export const stockLocationUpdateSchema = stockLocationCreateSchema.partial()

export const stockMovementCreateSchema = z.object({
  goodsItemId: z.string().uuid(),
  stockLocationId: z.string().uuid(),
  quantityDelta: z.number(),
  reason: z.string().max(500).optional(),
  reference: z.string().max(200).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type GoodsItemCreateInput = z.infer<typeof goodsItemCreateSchema>
export type StockLocationCreateInput = z.infer<typeof stockLocationCreateSchema>
export type StockMovementCreateInput = z.infer<typeof stockMovementCreateSchema>
