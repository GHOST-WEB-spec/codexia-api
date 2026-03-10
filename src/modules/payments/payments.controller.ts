import type { Context } from 'hono'
import { successResponse, errorResponse } from '../../lib/response.js'
import { createCheckoutSession, handleWebhook } from './payments.service.js'

export const checkout = async (c: Context) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()

    if (!body.orderId) return errorResponse(c, 'orderId is required')

    const session = await createCheckoutSession(body.orderId, user.userId)
    return successResponse(c, session)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const webhook = async (c: Context) => {
  try {
    const signature = c.req.header('stripe-signature')
    if (!signature) return errorResponse(c, 'No signature', 400)

    const payload = await c.req.text()
    const result = await handleWebhook(payload, signature)
    return successResponse(c, result)
  } catch (err: any) {
    return errorResponse(c, err.message, 400)
  }
}
