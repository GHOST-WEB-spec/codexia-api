import type { Context } from 'hono'
import { successResponse, errorResponse } from '../../lib/response.js'
import {
  getSellerDashboard,
  getSellerProducts,
  createSellerProfile,
  getSellerProfile,
} from './seller.service.js'

export const dashboard = async (c: Context) => {
  try {
    const user = c.get('user')
    const data = await getSellerDashboard(user.userId)
    return successResponse(c, data)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const myProducts = async (c: Context) => {
  try {
    const user = c.get('user')
    const data = await getSellerProducts(user.userId)
    return successResponse(c, data)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const upsertProfile = async (c: Context) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const profile = await createSellerProfile(user.userId, body)
    return successResponse(c, profile)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const getProfile = async (c: Context) => {
  try {
    const user = c.get('user')
    const profile = await getSellerProfile(user.userId)
    return successResponse(c, profile)
  } catch (err: any) {
    return errorResponse(c, err.message, 404)
  }
}
