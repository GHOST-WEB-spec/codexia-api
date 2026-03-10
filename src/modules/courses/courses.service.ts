import { eq, and } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { courses, lessons, products } from '../../db/schema/index.js'

export const createCourse = async (productId: string, sellerId: string, input: {
  difficulty?: string
  prerequisites?: string
  whatYouLearn?: string[]
}) => {
  const [product] = await db.select().from(products)
    .where(and(eq(products.id, productId), eq(products.sellerId, sellerId))).limit(1)

  if (!product) throw new Error('Product not found or unauthorized')
  if (product.productType !== 'course') throw new Error('Product is not a course')

  const [course] = await db.insert(courses).values({
    productId,
    difficulty: input.difficulty ?? 'beginner',
    prerequisites: input.prerequisites,
    whatYouLearn: input.whatYouLearn,
  }).returning()

  return course
}

export const addLesson = async (courseId: string, sellerId: string, input: {
  title: string
  description?: string
  videoUrl?: string
  duration?: number
  order: number
  isFreePreview?: boolean
}) => {
  const [course] = await db.select({ id: courses.id, productId: courses.productId })
    .from(courses).where(eq(courses.id, courseId)).limit(1)

  if (!course) throw new Error('Course not found')

  const [product] = await db.select().from(products)
    .where(and(eq(products.id, course.productId), eq(products.sellerId, sellerId))).limit(1)

  if (!product) throw new Error('Unauthorized')

  const [lesson] = await db.insert(lessons).values({
    courseId,
    title: input.title,
    description: input.description,
    videoUrl: input.videoUrl,
    duration: input.duration,
    order: input.order,
    isFreePreview: input.isFreePreview ?? false,
  }).returning()

  await db.update(courses).set({
    totalLessons: (course as any).totalLessons + 1,
    updatedAt: new Date(),
  }).where(eq(courses.id, courseId))

  return lesson
}

export const getCourseWithLessons = async (productId: string) => {
  const [course] = await db.select().from(courses)
    .where(eq(courses.productId, productId)).limit(1)

  if (!course) throw new Error('Course not found')

  const courseLessons = await db.select().from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(lessons.order)

  return { ...course, lessons: courseLessons }
}
