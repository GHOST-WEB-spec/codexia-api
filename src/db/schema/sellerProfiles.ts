import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sellerProfiles = pgTable('seller_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  bio: text('bio'),
  website: varchar('website', { length: 255 }),
  twitter: varchar('twitter', { length: 255 }),
  github: varchar('github', { length: 255 }),
  avatarUrl: text('avatar_url'),
  totalSales: integer('total_sales').default(0).notNull(),
  totalRevenue: integer('total_revenue').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
