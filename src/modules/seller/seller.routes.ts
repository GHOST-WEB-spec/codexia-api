import { Hono } from 'hono'
import { authMiddleware, sellerMiddleware } from '../../middleware/auth.middleware.js'
import { dashboard, myProducts, upsertProfile, getProfile } from './seller.controller.js'

export const sellerRoutes = new Hono()

sellerRoutes.use('*', authMiddleware, sellerMiddleware)

sellerRoutes.get('/dashboard', dashboard)
sellerRoutes.get('/products', myProducts)
sellerRoutes.get('/profile', getProfile)
sellerRoutes.post('/profile', upsertProfile)
