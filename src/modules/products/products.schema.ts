import { z } from 'zod'

export const createProductSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  shortDescription: z.string().max(500).optional(),
  price: z.number().min(0),
  comparePrice: z.number().optional(),
  productType: z.enum(['code', 'course']),
  licenceType: z.enum(['personal', 'commercial', 'both']).default('personal'),
  thumbnail: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  downloadLimit: z.number().default(5),
  isFree: z.boolean().default(false),
})

export const updateProductSchema = createProductSchema.partial()

export const searchProductSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['code', 'course']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  sort: z.enum(['newest', 'popular', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type SearchProductInput = z.infer<typeof searchProductSchema>
