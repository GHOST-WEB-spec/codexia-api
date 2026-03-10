import type { Context } from 'hono'
import { successResponse, errorResponse } from '../../lib/response.js'
import { createReview, getProductReviews } from './reviews.service.js'

export const create = async (c: Context) => {
  try {
    const user = c.get('user')
    const { productId } = c.req.param()
    const body = await c.req.json()
    const review = await createReview(user.userId, productId, body)
    return successResponse(c, review, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const getForProduct = async (c: Context) => {
  try {
    const { productId } = c.req.param()
    const data = await getProductReviews(productId)
    return successResponse(c, data)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}
