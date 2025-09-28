import { Hono } from 'hono'
import { WorkerEntrypoint } from 'cloudflare:workers'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { ProjectService } from './services/project.service'
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

// WorkerEntrypoint for RPC communication (named export)
export class IntroductionMakerAPI extends WorkerEntrypoint<Bindings> {
  // Helper function to create Prisma client
  private createPrismaClient(db: D1Database) {
    const adapter = new PrismaD1(db)
    return new PrismaClient({ adapter })
  }

  // RPC methods for projects
  async createProject(data: any) {
    const prisma = this.createPrismaClient(this.env.DB)
    const service = new ProjectService(prisma)

    try {
      const project = await service.createProject(data)
      return {
        success: true,
        data: project,
      }
    } catch (error) {
      console.error('Create project error:', error)
      return {
        success: false,
        error: 'Failed to create project',
      }
    }
  }

  async getProject(id: string) {
    const prisma = this.createPrismaClient(this.env.DB)
    const service = new ProjectService(prisma)

    try {
      const project = await service.getProject(id)

      if (!project) {
        return {
          success: false,
          error: 'Project not found',
        }
      }

      return {
        success: true,
        data: project,
      }
    } catch (error) {
      console.error('Get project error:', error)
      return {
        success: false,
        error: 'Failed to get project',
      }
    }
  }

  async updateProject(id: string, data: any) {
    const prisma = this.createPrismaClient(this.env.DB)
    const service = new ProjectService(prisma)

    try {
      const project = await service.updateProject(id, data)
      return {
        success: true,
        data: project,
      }
    } catch (error) {
      console.error('Update project error:', error)
      return {
        success: false,
        error: 'Failed to update project',
      }
    }
  }

  async deleteProject(id: string) {
    const prisma = this.createPrismaClient(this.env.DB)
    const service = new ProjectService(prisma)

    try {
      await service.deleteProject(id)
      return {
        success: true,
        message: 'Project deleted successfully',
      }
    } catch (error) {
      console.error('Delete project error:', error)
      return {
        success: false,
        error: 'Failed to delete project',
      }
    }
  }

  // Health check method
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.env.ENVIRONMENT || 'development',
    }
  }
}

// Default export for HTTP fetch handler
export default {
  fetch: app.fetch,
}