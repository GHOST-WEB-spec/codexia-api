import type { Context } from 'hono'
import { successResponse, errorResponse } from '../../lib/response.js'
import { createDiscount, validateDiscount, getSellerDiscounts } from './discounts.service.js'

export const create = async (c: Context) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const discount = await createDiscount(user.userId, body)
    return successResponse(c, discount, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const validate = async (c: Context) => {
  try {
    const { code } = c.req.param()
    const { orderAmount } = await c.req.json()
    const result = await validateDiscount(code, orderAmount)
    return successResponse(c, result)
  } catch (err: any) {
    return errorResponse(c, err.message, 400)
  }
}

export const myDiscounts = async (c: Context) => {
  try {
    const user = c.get('user')
    const data = await getSellerDiscounts(user.userId)
    return successResponse(c, data)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}
