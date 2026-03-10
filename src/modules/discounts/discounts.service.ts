import { eq, and } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { discounts } from '../../db/schema/index.js'

export const createDiscount = async (sellerId: string, input: {
  code: string
  discountType: 'percentage' | 'fixed'
  value: number
  maxUses?: number
  minOrderAmount?: number
  expiresAt?: string
}) => {
  const existing = await db.select().from(discounts)
    .where(eq(discounts.code, input.code.toUpperCase())).limit(1)

  if (existing.length > 0) throw new Error('Discount code already exists')

  const [discount] = await db.insert(discounts).values({
    sellerId,
    code: input.code.toUpperCase(),
    discountType: input.discountType,
    value: input.discountType === 'percentage' ? input.value : Math.round(input.value * 100),
    maxUses: input.maxUses,
    minOrderAmount: input.minOrderAmount ? Math.round(input.minOrderAmount * 100) : undefined,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
  }).returning()

  return discount
}

export const validateDiscount = async (code: string, orderAmount: number) => {
  const [discount] = await db.select().from(discounts)
    .where(and(eq(discounts.code, code.toUpperCase()), eq(discounts.isActive, true))).limit(1)

  if (!discount) throw new Error('Invalid discount code')
  if (discount.expiresAt && new Date() > discount.expiresAt) throw new Error('Discount code has expired')
  if (discount.maxUses && discount.usedCount >= discount.maxUses) throw new Error('Discount code has reached its limit')
  if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
    throw new Error(`Minimum order amount is £${(discount.minOrderAmount / 100).toFixed(2)}`)
  }

  const discountAmount = discount.discountType === 'percentage'
    ? Math.round(orderAmount * (discount.value / 100))
    : discount.value

  return {
    discount,
    discountAmount,
    finalAmount: Math.max(0, orderAmount - discountAmount),
  }
}

export const getSellerDiscounts = async (sellerId: string) => {
  return await db.select().from(discounts)
    .where(eq(discounts.sellerId, sellerId))
    .orderBy(discounts.createdAt)
}
