import { sql } from 'drizzle-orm'
import type { Db } from '@repo/db'

/** Run queries with Postgres `app.tenant_id` set for RLS on goods tables */
export async function withTenantTx<T>(db: Db, tenantId: string, fn: (tx: Db) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}::text, true)`)
    return fn(tx as unknown as Db)
  })
}
