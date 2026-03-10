import { eq, sum, count } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { products, orderItems, orders, sellerProfiles, users } from '../../db/schema/index.js'

export const getSellerDashboard = async (sellerId: string) => {
  const sellerProducts = await db.select().from(products)
    .where(eq(products.sellerId, sellerId))

  const totalProducts = sellerProducts.length
  const publishedProducts = sellerProducts.filter(p => p.status === 'published').length
  const draftProducts = sellerProducts.filter(p => p.status === 'draft').length

  const salesData = await db.select({
    totalOrders: count(orderItems.id),
    totalRevenue: sum(orderItems.price),
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(eq(orderItems.sellerId, sellerId))

  const recentSales = await db.select({
    id: orderItems.id,
    price: orderItems.price,
    createdAt: orderItems.createdAt,
    product: {
      id: products.id,
      title: products.title,
      thumbnail: products.thumbnail,
    },
    buyer: {
      id: users.id,
      fullName: users.fullName,
      email: users.email,
    },
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .leftJoin(users, eq(orders.buyerId, users.id))
  .where(eq(orderItems.sellerId, sellerId))
  .orderBy(orderItems.createdAt)
  .limit(10)

  return {
    stats: {
      totalProducts,
      publishedProducts,
      draftProducts,
      totalOrders: Number(salesData[0]?.totalOrders ?? 0),
      totalRevenue: Number(salesData[0]?.totalRevenue ?? 0),
      totalRevenuePounds: (Number(salesData[0]?.totalRevenue ?? 0) / 100).toFixed(2),
    },
    recentSales,
  }
}

export const getSellerProducts = async (sellerId: string) => {
  return await db.select().from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(products.createdAt)
}

export const createSellerProfile = async (userId: string, input: {
  displayName: string
  bio?: string
  website?: string
  twitter?: string
  github?: string
}) => {
  const existing = await db.select().from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId)).limit(1)

  if (existing.length > 0) {
    const [updated] = await db.update(sellerProfiles)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sellerProfiles.userId, userId))
      .returning()
    return updated
  }

  const [profile] = await db.insert(sellerProfiles).values({
    userId,
    displayName: input.displayName,
    bio: input.bio,
    website: input.website,
    twitter: input.twitter,
    github: input.github,
  }).returning()

  return profile
}

export const getSellerProfile = async (userId: string) => {
  const [profile] = await db.select().from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId)).limit(1)

  if (!profile) throw new Error('Seller profile not found')
  return profile
}
