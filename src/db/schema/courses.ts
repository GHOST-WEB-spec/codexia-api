import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { products } from './products.js'

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }).unique(),
  totalLessons: integer('total_lessons').default(0).notNull(),
  totalDuration: integer('total_duration').default(0), // in minutes
  difficulty: varchar('difficulty', { length: 50 }).default('beginner'),
  prerequisites: text('prerequisites'),
  whatYouLearn: text('what_you_learn').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: text('video_url'),
  duration: integer('duration'), // in minutes
  order: integer('order').notNull(),
  isFreePreview: boolean('is_free_preview').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
