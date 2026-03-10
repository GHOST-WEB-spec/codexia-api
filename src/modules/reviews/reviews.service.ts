import { eq, and, avg, count } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { reviews, products, downloads, users } from '../../db/schema/index.js'

export const createReview = async (userId: string, productId: string, input: {
  rating: number
  comment?: string
}) => {
  if (input.rating < 1 || input.rating > 5) throw new Error('Rating must be between 1 and 5')

  const existing = await db.select().from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId))).limit(1)

  if (existing.length > 0) throw new Error('You have already reviewed this product')

  const owned = await db.select().from(downloads)
    .where(and(eq(downloads.userId, userId), eq(downloads.productId, productId))).limit(1)

  const [review] = await db.insert(reviews).values({
    userId,
    productId,
    rating: input.rating,
    comment: input.comment,
    isVerifiedPurchase: owned.length > 0,
  }).returning()

  const [stats] = await db.select({
    avgRating: avg(reviews.rating),
    totalReviews: count(reviews.id),
  }).from(reviews).where(eq(reviews.productId, productId))

  await db.update(products).set({
    averageRating: Math.round(Number(stats.avgRating) * 10),
    totalReviews: Number(stats.totalReviews),
    updatedAt: new Date(),
  }).where(eq(products.id, productId))

  return review
}

export const getProductReviews = async (productId: string) => {
  return await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    isVerifiedPurchase: reviews.isVerifiedPurchase,
    createdAt: reviews.createdAt,
    user: {
      id: users.id,
      fullName: users.fullName,
      avatar: users.avatar,
    },
  })
  .from(reviews)
  .leftJoin(users, eq(reviews.userId, users.id))
  .where(eq(reviews.productId, productId))
  .orderBy(reviews.createdAt)
}
