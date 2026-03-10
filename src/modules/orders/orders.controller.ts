import type { Context } from 'hono'
import { successResponse, errorResponse } from '../../lib/response.js'
import { createOrder, getMyOrders, getDownloadLink } from './orders.service.js'

export const create = async (c: Context) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()

    if (!body.productIds || !Array.isArray(body.productIds)) {
      return errorResponse(c, 'productIds array is required')
    }

    const result = await createOrder(user.userId, body.productIds, body.discountCode)
    return successResponse(c, result, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const myOrders = async (c: Context) => {
  try {
    const user = c.get('user')
    const orderList = await getMyOrders(user.userId)
    return successResponse(c, orderList)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const download = async (c: Context) => {
  try {
    const user = c.get('user')
    const { productId, orderId } = c.req.param()
    const result = await getDownloadLink(user.userId, productId, orderId)
    return successResponse(c, result)
  } catch (err: any) {
    return errorResponse(c, err.message, 403)
  }
}
