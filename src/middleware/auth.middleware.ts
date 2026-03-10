import type { Context, Next } from 'hono'
import { verifyAccessToken } from '../lib/jwt.js'
import { errorResponse } from '../lib/response.js'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(c, 'Unauthorized', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyAccessToken(token)
    c.set('user', payload)
    await next()
  } catch {
    return errorResponse(c, 'Invalid or expired token', 401)
  }
}

export const sellerMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (user?.role !== 'seller' && user?.role !== 'admin') {
    return errorResponse(c, 'Seller access required', 403)
  }
  await next()
}

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (user?.role !== 'admin') {
    return errorResponse(c, 'Admin access required', 403)
  }
  await next()
}
