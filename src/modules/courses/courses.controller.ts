import type { Context } from 'hono'
import { successResponse, errorResponse } from '../../lib/response.js'
import { createCourse, addLesson, getCourseWithLessons } from './courses.service.js'

export const create = async (c: Context) => {
  try {
    const user = c.get('user')
    const { productId } = c.req.param()
    const body = await c.req.json()
    const course = await createCourse(productId, user.userId, body)
    return successResponse(c, course, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const createLesson = async (c: Context) => {
  try {
    const user = c.get('user')
    const { courseId } = c.req.param()
    const body = await c.req.json()
    const lesson = await addLesson(courseId, user.userId, body)
    return successResponse(c, lesson, 201)
  } catch (err: any) {
    return errorResponse(c, err.message)
  }
}

export const getWithLessons = async (c: Context) => {
  try {
    const { productId } = c.req.param()
    const course = await getCourseWithLessons(productId)
    return successResponse(c, course)
  } catch (err: any) {
    return errorResponse(c, err.message, 404)
  }
}
