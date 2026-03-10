import { Hono } from 'hono'
import { authMiddleware, sellerMiddleware } from '../../middleware/auth.middleware.js'
import { create, update, publish, remove, getBySlug, search } from './products.controller.js'

export const productRoutes = new Hono()

// Public routes
productRoutes.get('/', search)
productRoutes.get('/:slug', getBySlug)

// Seller only routes
productRoutes.post('/', authMiddleware, sellerMiddleware, create)
productRoutes.put('/:id', authMiddleware, sellerMiddleware, update)
productRoutes.patch('/:id/publish', authMiddleware, sellerMiddleware, publish)
productRoutes.delete('/:id', authMiddleware, sellerMiddleware, remove)
