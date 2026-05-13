import { z } from 'zod'

const serverEnv = z.object({
  API_URL: z.string().url(),
})

export function getServerEnv() {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  return serverEnv.parse({ API_URL: url })
}

const clientEnv = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('Goods Tracker'),
})

export function getClientEnv() {
  return clientEnv.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  })
}
