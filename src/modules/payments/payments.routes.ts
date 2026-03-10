import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { checkout, webhook } from './payments.controller.js'

export const paymentRoutes = new Hono()

paymentRoutes.post('/checkout', authMiddleware, checkout)
paymentRoutes.post('/webhook', webhook)
