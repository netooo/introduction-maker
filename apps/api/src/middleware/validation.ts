import { createMiddleware } from 'hono/factory'
import { zValidator } from '@hono/zod-validator'
import type { z } from 'zod'

// JSON validation middleware
export const validateJson = <T extends z.ZodSchema>(schema: T) =>
  zValidator('json', schema)

// Query validation middleware  
export const validateQuery = <T extends z.ZodSchema>(schema: T) =>
  zValidator('query', schema)

// Param validation middleware
export const validateParam = <T extends z.ZodSchema>(schema: T) =>
  zValidator('param', schema)

// Error handling middleware
export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
    
    return c.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, 500)
  }
})