import { pgTable, uuid, varchar, text, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const productTypeEnum = pgEnum('product_type', ['code', 'course'])
export const licenceTypeEnum = pgEnum('licence_type', ['personal', 'commercial', 'both'])
export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived'])

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  shortDescription: varchar('short_description', { length: 500 }),
  price: integer('price').notNull(), // stored in pence/cents
  comparePrice: integer('compare_price'), // original price for discounts display
  productType: productTypeEnum('product_type').notNull(),
  licenceType: licenceTypeEnum('licence_type').default('personal').notNull(),
  status: productStatusEnum('status').default('draft').notNull(),
  thumbnail: text('thumbnail'),
  previewUrl: text('preview_url'), // code preview / course trailer
  fileUrl: text('file_url'), // for code products
  fileSize: integer('file_size'), // in bytes
  downloadLimit: integer('download_limit').default(5).notNull(),
  isFree: boolean('is_free').default(false).notNull(),
  tags: text('tags').array(),
  totalSales: integer('total_sales').default(0).notNull(),
  averageRating: integer('average_rating').default(0),
  totalReviews: integer('total_reviews').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
