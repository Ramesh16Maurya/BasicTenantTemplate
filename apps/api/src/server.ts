import { serve } from '@hono/node-server'
import { loadEnv } from './env.js'
import { createLogger } from './logger.js'
import { createAppDb } from './db.js'
import { createApp } from './app.js'

const env = loadEnv()
const logger = createLogger(env)
const db = createAppDb(env)
const app = createApp(env, logger, db)

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info({ port: info.port }, 'API listening')
})
