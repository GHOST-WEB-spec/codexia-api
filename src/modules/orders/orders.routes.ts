import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { create, myOrders, download } from './orders.controller.js'

export const orderRoutes = new Hono()

orderRoutes.post('/', authMiddleware, create)
orderRoutes.get('/my', authMiddleware, myOrders)
orderRoutes.get('/download/:productId/:orderId', authMiddleware, download)
