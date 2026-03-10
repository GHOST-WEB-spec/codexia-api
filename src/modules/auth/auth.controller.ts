import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { registerUser, loginUser, refreshAccessToken, logoutUser } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.schema.js'
import { successResponse, errorResponse } from '../../lib/response.js'

export const register = async (c: Context) => {
  try {
    const body = await c.req.json()
    const input = registerSchema.parse(body)
    const { user, accessToken, refreshToken } = await registerUser(input)

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return successResponse(c, { user, accessToken }, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const login = async (c: Context) => {
  try {
    const body = await c.req.json()
    const input = loginSchema.parse(body)
    const { user, accessToken, refreshToken } = await loginUser(input)

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return successResponse(c, { user, accessToken })
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const refresh = async (c: Context) => {
  try {
    const token = getCookie(c, 'refreshToken')
    if (!token) return errorResponse(c, 'No refresh token', 401)

    const { accessToken } = await refreshAccessToken(token)
    return successResponse(c, { accessToken })
  } catch (err: any) {
    return errorResponse(c, 'Invalid refresh token', 401)
  }
}

export const logout = async (c: Context) => {
  try {
    const user = c.get('user')
    if (user) await logoutUser(user.userId)

    deleteCookie(c, 'refreshToken')
    return successResponse(c, { message: 'Logged out successfully' })
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}
