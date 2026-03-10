import { eq } from 'drizzle-orm'
import { stripe } from '../../config/stripe.js'
import { db } from '../../config/db.js'
import { orders, orderItems, products, users } from '../../db/schema/index.js'
import { completeOrder } from '../orders/orders.service.js'
import { env } from '../../config/env.js'

export const createCheckoutSession = async (orderId: string, buyerId: string) => {
  const [order] = await db.select().from(orders)
    .where(eq(orders.id, orderId)).limit(1)

  if (!order) throw new Error('Order not found')
  if (order.buyerId !== buyerId) throw new Error('Unauthorized')
  if (order.status !== 'pending') throw new Error('Order is not pending')

  const items = await db.select({
    price: orderItems.price,
    product: {
      id: products.id,
      title: products.title,
      description: products.shortDescription,
      thumbnail: products.thumbnail,
    },
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, orderId))

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'gbp',
      product_data: {
        name: item.product?.title ?? 'Product',
        description: item.product?.description ?? undefined,
        images: item.product?.thumbnail ? [item.product.thumbnail] : [],
      },
      unit_amount: item.price,
    },
    quantity: 1,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `http://localhost:5173/orders/${orderId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/orders/${orderId}/cancel`,
    metadata: {
      orderId,
      buyerId,
    },
  })

  return { sessionId: session.id, url: session.url }
}

export const handleWebhook = async (payload: string, signature: string) => {
  let event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    throw new Error('Invalid webhook signature')
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const { orderId } = session.metadata

      await completeOrder(orderId, session.id)
      console.log(`✅ Order ${orderId} completed via Stripe`)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as any
      const { orderId } = session.metadata

      await db.update(orders)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(orders.id, orderId))

      console.log(`❌ Order ${orderId} expired`)
      break
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`)
  }

  return { received: true }
}
