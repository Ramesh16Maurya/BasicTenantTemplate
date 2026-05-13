import { and, eq, inArray } from 'drizzle-orm'
import type { Db } from '@repo/db'
import { permissions, rolePermissions, roles, userRoles } from '@repo/db'
import type { PermissionCode } from '@repo/contracts'

export async function listUserPermissionCodes(
  db: Db,
  userId: string,
  tenantId: string,
): Promise<Set<PermissionCode>> {
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.tenantId, tenantId)))

  if (userRoleRows.length === 0) return new Set()

  const roleIds = userRoleRows.map((r) => r.roleId)
  const permRows = await db
    .select({ code: permissions.code })
    .from(rolePermissions)
    .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(roles.tenantId, tenantId), inArray(rolePermissions.roleId, roleIds)))

  return new Set(permRows.map((p) => p.code as PermissionCode))
}

export function requirePermission(codes: Set<string>, required: string): boolean {
  return codes.has(required)
}
