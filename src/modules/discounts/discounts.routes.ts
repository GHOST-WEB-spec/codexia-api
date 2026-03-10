import { Hono } from 'hono'
import { authMiddleware, sellerMiddleware } from '../../middleware/auth.middleware.js'
import { create, validate, myDiscounts } from './discounts.controller.js'

export const discountRoutes = new Hono()

discountRoutes.post('/validate/:code', authMiddleware, validate)
discountRoutes.post('/', authMiddleware, sellerMiddleware, create)
discountRoutes.get('/', authMiddleware, sellerMiddleware, myDiscounts)
