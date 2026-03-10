import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type JWTPayload = {
  userId: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
}

export const signAccessToken = (payload: JWTPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES as any })

export const signRefreshToken = (payload: JWTPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES as any })

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload
