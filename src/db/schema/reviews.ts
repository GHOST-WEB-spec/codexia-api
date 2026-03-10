import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import { products } from './products'

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
