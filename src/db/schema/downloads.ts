import { pgTable, uuid, timestamp, integer, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'
import { products } from './products'
import { orders } from './orders'

export const downloads = pgTable('downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  downloadCount: integer('download_count').default(0).notNull(),
  maxDownloads: integer('max_downloads').default(5).notNull(),
  lastDownloadedAt: timestamp('last_downloaded_at'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
