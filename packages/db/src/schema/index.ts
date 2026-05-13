import {
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  integer,
} from 'drizzle-orm/pg-core'

/** Reusable tenant-scoped audit columns */
export const tenantScopedBase = {
  tenantId: uuid('tenant_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdById: uuid('created_by_id'),
  updatedById: uuid('updated_by_id'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    fullName: varchar('full_name', { length: 200 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email)],
)

export const tenantMembers = pgTable(
  'tenant_members',
  {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 32 }).notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.tenantId, t.userId] }), index('tenant_members_user_idx').on(t.userId)],
)

export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 128 }).notNull(),
    description: varchar('description', { length: 500 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('permissions_code_uq').on(t.code)],
)

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 120 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('roles_tenant_slug_uq').on(t.tenantId, t.slug), index('roles_tenant_idx').on(t.tenantId)],
)

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
)

export const userRoles = pgTable(
  'user_roles',
  {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.tenantId, t.userId, t.roleId] }), index('user_roles_user_tenant_idx').on(t.userId, t.tenantId)],
)

export const goodsItems = pgTable(
  'goods_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ...tenantScopedBase,
    sku: varchar('sku', { length: 64 }).notNull(),
    name: varchar('name', { length: 500 }).notNull(),
    unit: varchar('unit', { length: 32 }).notNull().default('ea'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  },
  (t) => [uniqueIndex('goods_items_tenant_sku_uq').on(t.tenantId, t.sku), index('goods_items_tenant_idx').on(t.tenantId)],
)

export const stockLocations = pgTable(
  'stock_locations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ...tenantScopedBase,
    name: varchar('name', { length: 200 }).notNull(),
    code: varchar('code', { length: 64 }),
  },
  (t) => [index('stock_locations_tenant_idx').on(t.tenantId)],
)

export const stockMovements = pgTable(
  'stock_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ...tenantScopedBase,
    goodsItemId: uuid('goods_item_id')
      .notNull()
      .references(() => goodsItems.id, { onDelete: 'restrict' }),
    stockLocationId: uuid('stock_location_id')
      .notNull()
      .references(() => stockLocations.id, { onDelete: 'restrict' }),
    quantityDelta: integer('quantity_delta').notNull(),
    reason: varchar('reason', { length: 500 }),
    reference: varchar('reference', { length: 200 }),
  },
  (t) => [index('stock_movements_tenant_idx').on(t.tenantId), index('stock_movements_item_idx').on(t.goodsItemId)],
)
