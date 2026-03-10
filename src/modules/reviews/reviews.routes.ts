import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { create, getForProduct } from './reviews.controller.js'

export const reviewRoutes = new Hono()

reviewRoutes.get('/:productId', getForProduct)
reviewRoutes.post('/:productId', authMiddleware, create)
