import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const orderStatusEnum = pgEnum('order_status', ['pending', 'completed', 'refunded', 'failed'])

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  status: orderStatusEnum('status').default('pending').notNull(),
  total: integer('total').notNull(), // in pence/cents
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  discountCode: varchar('discount_code', { length: 50 }),
  discountAmount: integer('discount_amount').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull(),
  sellerId: uuid('seller_id').notNull(),
  price: integer('price').notNull(),
  licenceType: varchar('licence_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
