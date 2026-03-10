import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean, integer } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['buyer', 'seller', 'admin'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  role: roleEnum('role').default('buyer').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
