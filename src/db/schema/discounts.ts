import { pgTable, uuid, varchar, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed'])

export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  value: integer('value').notNull(), // % or pence/cents
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0).notNull(),
  minOrderAmount: integer('min_order_amount'),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
