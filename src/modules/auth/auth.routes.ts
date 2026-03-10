import { Hono } from 'hono'
import { register, login, refresh, logout } from './auth.controller.js'

export const authRoutes = new Hono()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/refresh', refresh)
authRoutes.post('/logout', logout)
