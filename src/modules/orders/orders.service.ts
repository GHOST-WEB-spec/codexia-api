import { eq, and } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { orders, orderItems, products, downloads, users } from '../../db/schema/index.js'
import { v4 as uuidv4 } from 'uuid'

export const createOrder = async (buyerId: string, productIds: string[], discountCode?: string) => {
  // Fetch all products
  const productList = await Promise.all(
    productIds.map(async (id) => {
      const [p] = await db.select().from(products)
        .where(and(eq(products.id, id), eq(products.status, 'published'))).limit(1)
      if (!p) throw new Error(`Product ${id} not found or unavailable`)
      return p
    })
  )

  // Check buyer doesn't already own any of these
  for (const product of productList) {
    const existing = await db.select().from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orderItems.productId, product.id),
        eq(orders.buyerId, buyerId),
        eq(orders.status, 'completed')
      )).limit(1)
    if (existing.length > 0) throw new Error(`You already own "${product.title}"`)
  }

  const total = productList.reduce((sum, p) => sum + p.price, 0)

  const [order] = await db.insert(orders).values({
    buyerId,
    total,
    status: 'pending',
    discountCode,
  }).returning()

  const items = await Promise.all(
    productList.map((p) =>
      db.insert(orderItems).values({
        orderId: order.id,
        productId: p.id,
        sellerId: p.sellerId,
        price: p.price,
        licenceType: p.licenceType,
      }).returning()
    )
  )

  return { order, items: items.flat() }
}

export const completeOrder = async (orderId: string, stripeSessionId: string) => {
  const [order] = await db.update(orders)
    .set({ status: 'completed', stripeSessionId, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning()

  if (!order) throw new Error('Order not found')

  // Create download records for each item
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId))

  for (const item of items) {
    const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1)

    await db.insert(downloads).values({
      userId: order.buyerId,
      productId: item.productId,
      orderId: order.id,
      downloadCount: 0,
      maxDownloads: product?.downloadLimit ?? 5,
    })

    // Increment product total sales
    await db.update(products).set({
      totalSales: (product?.totalSales ?? 0) + 1,
      updatedAt: new Date(),
    }).where(eq(products.id, item.productId))
  }

  return order
}

export const getMyOrders = async (buyerId: string) => {
  const myOrders = await db.select().from(orders)
    .where(eq(orders.buyerId, buyerId))
    .orderBy(orders.createdAt)

  const ordersWithItems = await Promise.all(
    myOrders.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        price: orderItems.price,
        licenceType: orderItems.licenceType,
        product: {
          id: products.id,
          title: products.title,
          slug: products.slug,
          thumbnail: products.thumbnail,
          productType: products.productType,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))

      return { ...order, items }
    })
  )

  return ordersWithItems
}

export const getDownloadLink = async (userId: string, productId: string, orderId: string) => {
  // Check they own this product via a completed order
  const [download] = await db.select().from(downloads)
    .where(and(
      eq(downloads.userId, userId),
      eq(downloads.productId, productId),
      eq(downloads.orderId, orderId),
    )).limit(1)

  if (!download) throw new Error('Purchase not found')
  if (download.downloadCount >= download.maxDownloads) {
    throw new Error(`Download limit reached (${download.maxDownloads} downloads max)`)
  }

  const [product] = await db.select().from(products)
    .where(eq(products.id, productId)).limit(1)

  if (!product?.fileUrl) throw new Error('File not available')

  // Increment download count
  await db.update(downloads).set({
    downloadCount: download.downloadCount + 1,
    lastDownloadedAt: new Date(),
  }).where(eq(downloads.id, download.id))

  return {
    fileUrl: product.fileUrl,
    downloadsRemaining: download.maxDownloads - download.downloadCount - 1,
    title: product.title,
  }
}

export const checkOwnership = async (userId: string, productId: string) => {
  const result = await db.select().from(downloads)
    .where(and(
      eq(downloads.userId, userId),
      eq(downloads.productId, productId),
    )).limit(1)

  return result.length > 0
}
