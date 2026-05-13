import { SignJWT, jwtVerify } from 'jose'
import type { Env } from './env.js'

function secretKey(env: Env) {
  return new TextEncoder().encode(env.JWT_SECRET)
}

export async function signAccessToken(userId: string, env: Env): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setAudience('access')
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_EXPIRES_SEC}s`)
    .sign(secretKey(env))
}

export async function signRefreshToken(userId: string, env: Env): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setAudience('refresh')
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_REFRESH_EXPIRES_SEC}s`)
    .sign(secretKey(env))
}

export async function verifyAccessToken(token: string, env: Env): Promise<string> {
  const { payload } = await jwtVerify(token, secretKey(env), { audience: 'access' })
  if (!payload.sub) throw new Error('Invalid access token')
  return payload.sub
}

export async function verifyRefreshToken(token: string, env: Env): Promise<string> {
  const { payload } = await jwtVerify(token, secretKey(env), { audience: 'refresh' })
  if (!payload.sub) throw new Error('Invalid refresh token')
  return payload.sub
}
