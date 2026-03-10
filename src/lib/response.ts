import type { Context } from 'hono'

export const successResponse = (c: Context, data: unknown, status = 200) =>
  c.json({ success: true, data }, status as any)

export const errorResponse = (c: Context, message: string, status = 400) =>
  c.json({ success: false, error: message }, status as any)

export const paginatedResponse = (
  c: Context,
  data: unknown,
  meta: { page: number; limit: number; total: number }
) =>
  c.json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
      hasNext: meta.page * meta.limit < meta.total,
    },
  })
