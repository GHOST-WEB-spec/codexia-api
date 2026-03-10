import type { Context } from 'hono'
import { successResponse, errorResponse, paginatedResponse } from '../../lib/response.js'
import { createProductSchema, updateProductSchema, searchProductSchema } from './products.schema.js'
import {
  createProduct, updateProduct, publishProduct,
  deleteProduct, getProductBySlug, searchProducts
} from './products.service.js'

export const create = async (c: Context) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const input = createProductSchema.parse(body)
    const product = await createProduct(user.userId, input)
    return successResponse(c, product, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const update = async (c: Context) => {
  try {
    const user = c.get('user')
    const { id } = c.req.param()
    const body = await c.req.json()
    const input = updateProductSchema.parse(body)
    const product = await updateProduct(id, user.userId, input)
    return successResponse(c, product)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const publish = async (c: Context) => {
  try {
    const user = c.get('user')
    const { id } = c.req.param()
    const product = await publishProduct(id, user.userId)
    return successResponse(c, product)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const remove = async (c: Context) => {
  try {
    const user = c.get('user')
    const { id } = c.req.param()
    await deleteProduct(id, user.userId)
    return successResponse(c, { message: 'Product deleted' })
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const getBySlug = async (c: Context) => {
  try {
    const { slug } = c.req.param()
    const product = await getProductBySlug(slug)
    return successResponse(c, product)
  } catch (err: any) {
    return errorResponse(c, err.message, 404)
  }
}

export const search = async (c: Context) => {
  try {
    const query = c.req.query()
    const input = searchProductSchema.parse(query)
    const { results, total, page, limit } = await searchProducts(input)
    return paginatedResponse(c, results, { page, limit, total })
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}
