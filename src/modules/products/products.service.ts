import { eq, like, and, gte, lte, desc, asc, sql, count } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { products, users, courses, lessons } from '../../db/schema/index.js'
import type { CreateProductInput, UpdateProductInput, SearchProductInput } from './products.schema.js'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

export const createProduct = async (sellerId: string, input: CreateProductInput) => {
  const baseSlug = slugify(input.title, { lower: true, strict: true })
  const slug = `${baseSlug}-${uuidv4().slice(0, 8)}`

  const [product] = await db.insert(products).values({
    sellerId,
    title: input.title,
    slug,
    description: input.description,
    shortDescription: input.shortDescription,
    price: Math.round(input.price * 100),
    comparePrice: input.comparePrice ? Math.round(input.comparePrice * 100) : undefined,
    productType: input.productType,
    licenceType: input.licenceType,
    thumbnail: input.thumbnail,
    previewUrl: input.previewUrl,
    tags: input.tags,
    downloadLimit: input.downloadLimit,
    isFree: input.isFree,
    status: 'draft',
  }).returning()

  return product
}

export const updateProduct = async (productId: string, sellerId: string, input: UpdateProductInput) => {
  const [existing] = await db.select().from(products)
    .where(and(eq(products.id, productId), eq(products.sellerId, sellerId))).limit(1)

  if (!existing) throw new Error('Product not found or unauthorized')

  const updateData: any = { ...input, updatedAt: new Date() }
  if (input.price) updateData.price = Math.round(input.price * 100)
  if (input.comparePrice) updateData.comparePrice = Math.round(input.comparePrice * 100)

  const [updated] = await db.update(products).set(updateData)
    .where(eq(products.id, productId)).returning()

  return updated
}

export const publishProduct = async (productId: string, sellerId: string) => {
  const [existing] = await db.select().from(products)
    .where(and(eq(products.id, productId), eq(products.sellerId, sellerId))).limit(1)

  if (!existing) throw new Error('Product not found or unauthorized')

  const [updated] = await db.update(products)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(products.id, productId)).returning()

  return updated
}

export const deleteProduct = async (productId: string, sellerId: string) => {
  const [existing] = await db.select().from(products)
    .where(and(eq(products.id, productId), eq(products.sellerId, sellerId))).limit(1)

  if (!existing) throw new Error('Product not found or unauthorized')

  await db.delete(products).where(eq(products.id, productId))
}

export const getProductBySlug = async (slug: string) => {
  const [product] = await db.select({
    id: products.id,
    title: products.title,
    slug: products.slug,
    description: products.description,
    shortDescription: products.shortDescription,
    price: products.price,
    comparePrice: products.comparePrice,
    productType: products.productType,
    licenceType: products.licenceType,
    thumbnail: products.thumbnail,
    previewUrl: products.previewUrl,
    tags: products.tags,
    isFree: products.isFree,
    totalSales: products.totalSales,
    averageRating: products.averageRating,
    totalReviews: products.totalReviews,
    downloadLimit: products.downloadLimit,
    createdAt: products.createdAt,
    seller: {
      id: users.id,
      fullName: users.fullName,
      avatar: users.avatar,
    },
  })
  .from(products)
  .leftJoin(users, eq(products.sellerId, users.id))
  .where(and(eq(products.slug, slug), eq(products.status, 'published')))
  .limit(1)

  if (!product) throw new Error('Product not found')
  return product
}

export const searchProducts = async (input: SearchProductInput) => {
  const { q, type, minPrice, maxPrice, sort, page, limit } = input
  const offset = (page - 1) * limit

  const conditions = [eq(products.status, 'published')]

  if (q) conditions.push(like(products.title, `%${q}%`))
  if (type) conditions.push(eq(products.productType, type))
  if (minPrice) conditions.push(gte(products.price, Math.round(minPrice * 100)))
  if (maxPrice) conditions.push(lte(products.price, Math.round(maxPrice * 100)))

  const orderBy = sort === 'popular' ? desc(products.totalSales)
    : sort === 'price_asc' ? asc(products.price)
    : sort === 'price_desc' ? desc(products.price)
    : desc(products.createdAt)

  const [{ total }] = await db.select({ total: count() })
    .from(products).where(and(...conditions))

  const results = await db.select({
    id: products.id,
    title: products.title,
    slug: products.slug,
    shortDescription: products.shortDescription,
    price: products.price,
    comparePrice: products.comparePrice,
    productType: products.productType,
    licenceType: products.licenceType,
    thumbnail: products.thumbnail,
    isFree: products.isFree,
    totalSales: products.totalSales,
    averageRating: products.averageRating,
    totalReviews: products.totalReviews,
    tags: products.tags,
    createdAt: products.createdAt,
    seller: {
      id: users.id,
      fullName: users.fullName,
      avatar: users.avatar,
    },
  })
  .from(products)
  .leftJoin(users, eq(products.sellerId, users.id))
  .where(and(...conditions))
  .orderBy(orderBy)
  .limit(limit)
  .offset(offset)

  return { results, total, page, limit }
}
