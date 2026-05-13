import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import { PERMISSIONS } from '@repo/contracts'
import * as schema from './schema/index.js'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client, { schema })

const all = Object.values(PERMISSIONS) as string[]
for (const code of all) {
  const existing = await db.select().from(schema.permissions).where(eq(schema.permissions.code, code)).limit(1)
  if (existing.length === 0) {
    await db.insert(schema.permissions).values({ code, description: code })
    console.log('Seeded permission', code)
  }
}

await client.end()
console.log('Seed complete')
