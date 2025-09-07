import { createMiddleware } from 'hono/factory'
import type { HTTPException } from 'hono/http-exception'

export const errorMiddleware = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (error) {
    console.error('Error:', error)

    // HTTPExceptionの場合
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as HTTPException
      return c.json({
        success: false,
        error: httpError.message,
        status: httpError.status,
        timestamp: new Date().toISOString(),
      }, httpError.status)
    }

    // Zodバリデーションエラーの場合
    if (error && typeof error === 'object' && 'issues' in error) {
      return c.json({
        success: false,
        error: 'Validation failed',
        details: error.issues,
        timestamp: new Date().toISOString(),
      }, 400)
    }

    // その他のエラー
    return c.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, 500)
  }
})