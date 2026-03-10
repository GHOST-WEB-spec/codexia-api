import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { authRoutes } from './modules/auth/auth.routes.js'
import { productRoutes } from './modules/products/products.routes.js'
import { courseRoutes } from './modules/courses/courses.routes.js'
import { orderRoutes } from './modules/orders/orders.routes.js'
import { paymentRoutes } from './modules/payments/payments.routes.js'
import { sellerRoutes } from './modules/seller/seller.routes.js'
import { reviewRoutes } from './modules/reviews/reviews.routes.js'
import { discountRoutes } from './modules/discounts/discounts.routes.js'

export const app = new Hono()

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}))

app.get('/health', (c) => c.json({
  status: 'ok',
  app: 'Codexia API',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}))

app.route('/api/auth', authRoutes)
app.route('/api/products', productRoutes)
app.route('/api/courses', courseRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/api/seller', sellerRoutes)
app.route('/api/reviews', reviewRoutes)
app.route('/api/discounts', discountRoutes)

app.notFound((c) => c.json({ success: false, error: 'Route not found' }, 404))

app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`)
  return c.json({ success: false, error: 'Internal server error' }, 500)
})
