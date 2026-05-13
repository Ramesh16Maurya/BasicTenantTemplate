import { createDb } from '@repo/db'
import type { Env } from './env.js'

export function createAppDb(env: Env) {
  return createDb(env.DATABASE_URL)
}
