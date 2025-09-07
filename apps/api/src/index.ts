import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import { errorMiddleware } from './middleware/error'
import { projects } from './routes/projects'
import { images } from './routes/images'
import { templates } from './routes/templates'

type Bindings = {
  DB: D1Database
  R2: R2Bucket
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', corsMiddleware)
app.use('*', errorMiddleware)

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
  })
})

// API routes
app.route('/api/projects', projects)
app.route('/api/images', images)
app.route('/api/templates', templates)

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  }, 404)
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Introduction Maker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      projects: '/api/projects',
      images: '/api/images',
      templates: '/api/templates',
    },
  })
})

export default {
  fetch: app.fetch,
}