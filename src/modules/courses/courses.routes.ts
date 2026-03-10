import { Hono } from 'hono'
import { authMiddleware, sellerMiddleware } from '../../middleware/auth.middleware.js'
import { create, createLesson, getWithLessons } from './courses.controller.js'

export const courseRoutes = new Hono()

courseRoutes.get('/:productId', getWithLessons)
courseRoutes.post('/:productId', authMiddleware, sellerMiddleware, create)
courseRoutes.post('/:courseId/lessons', authMiddleware, sellerMiddleware, createLesson)
