import { eq } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { users } from '../../db/schema/index.js'
import { hashPassword, comparePassword } from '../../lib/hash.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js'
import type { RegisterInput, LoginInput } from './auth.schema.js'

export const registerUser = async (input: RegisterInput) => {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
  if (existing.length > 0) throw new Error('Email already in use')

  const hashed = await hashPassword(input.password)

  const [user] = await db.insert(users).values({
    fullName: input.fullName,
    email: input.email,
    password: hashed,
    role: input.role,
  }).returning({
    id: users.id,
    email: users.email,
    fullName: users.fullName,
    role: users.role,
  })

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

  await db.update(users).set({ refreshToken }).where(eq(users.id, user.id))

  return { user, accessToken, refreshToken }
}

export const loginUser = async (input: LoginInput) => {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
  if (!user) throw new Error('Invalid email or password')
  if (user.isBanned) throw new Error('Your account has been banned')

  const valid = await comparePassword(input.password, user.password)
  if (!valid) throw new Error('Invalid email or password')

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

  await db.update(users).set({ refreshToken }).where(eq(users.id, user.id))

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    accessToken,
    refreshToken,
  }
}

export const refreshAccessToken = async (token: string) => {
  const payload = verifyRefreshToken(token)

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
  if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
  return { accessToken }
}

export const logoutUser = async (userId: string) => {
  await db.update(users).set({ refreshToken: null }).where(eq(users.id, userId))
}
