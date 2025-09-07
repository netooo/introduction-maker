import { Hono } from 'hono'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { ProjectService } from '../services/project.service'
import { validateJson, validateParam } from '../middleware/validation'
import { CreateProjectSchema, UpdateProjectSchema, CreateItemSchema, UpdateItemSchema } from '../validators/schemas'

type Bindings = {
  DB: D1Database
  R2: R2Bucket
}

const projects = new Hono<{ Bindings: Bindings }>()

// UUID validation schema
const UUIDSchema = z.object({
  id: z.string().uuid(),
})

// Helper function to create Prisma client
function createPrismaClient(db: D1Database) {
  const adapter = new PrismaD1(db)
  return new PrismaClient({ adapter })
}

// Projects routes
projects.post('/', validateJson(CreateProjectSchema), async (c) => {
  const data = c.req.valid('json')
  const prisma = createPrismaClient(c.env.DB)
  const service = new ProjectService(prisma)
  
  try {
    const project = await service.createProject(data)
    return c.json({
      success: true,
      data: project,
    }, 201)
  } catch (error) {
    console.error('Create project error:', error)
    return c.json({
      success: false,
      error: 'Failed to create project',
    }, 500)
  }
})

projects.get('/:id', validateParam(UUIDSchema), async (c) => {
  const { id } = c.req.valid('param')
  const prisma = createPrismaClient(c.env.DB)
  const service = new ProjectService(prisma)
  
  try {
    const project = await service.getProject(id)
    
    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found',
      }, 404)
    }
    
    return c.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Get project error:', error)
    return c.json({
      success: false,
      error: 'Failed to get project',
    }, 500)
  }
})

projects.put('/:id', validateParam(UUIDSchema), validateJson(UpdateProjectSchema), async (c) => {
  const { id } = c.req.valid('param')
  const data = c.req.valid('json')
  const prisma = createPrismaClient(c.env.DB)
  const service = new ProjectService(prisma)
  
  try {
    const project = await service.updateProject(id, data)
    return c.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Update project error:', error)
    return c.json({
      success: false,
      error: 'Failed to update project',
    }, 500)
  }
})

projects.delete('/:id', validateParam(UUIDSchema), async (c) => {
  const { id } = c.req.valid('param')
  const prisma = createPrismaClient(c.env.DB)
  const service = new ProjectService(prisma)
  
  try {
    await service.deleteProject(id)
    return c.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Delete project error:', error)
    return c.json({
      success: false,
      error: 'Failed to delete project',
    }, 500)
  }
})

// Items routes
projects.post('/:id/items', validateParam(UUIDSchema), validateJson(CreateItemSchema), async (c) => {
  const { id: projectId } = c.req.valid('param')
  const data = c.req.valid('json')
  const prisma = createPrismaClient(c.env.DB)
  const service = new ProjectService(prisma)
  
  try {
    const item = await service.createItem(projectId, data)
    return c.json({
      success: true,
      data: item,
    }, 201)
  } catch (error) {
    console.error('Create item error:', error)
    return c.json({
      success: false,
      error: 'Failed to create item',
    }, 500)
  }
})

projects.get('/:id/items', validateParam(UUIDSchema), async (c) => {
  const { id: projectId } = c.req.valid('param')
  const prisma = createPrismaClient(c.env.DB)
  const service = new ProjectService(prisma)
  
  try {
    const items = await service.getProjectItems(projectId)
    return c.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('Get items error:', error)
    return c.json({
      success: false,
      error: 'Failed to get items',
    }, 500)
  }
})

projects.put('/:projectId/items/:itemId', 
  validateParam(z.object({ projectId: z.string().uuid(), itemId: z.string().uuid() })),
  validateJson(UpdateItemSchema),
  async (c) => {
    const { itemId } = c.req.valid('param')
    const data = c.req.valid('json')
    const prisma = createPrismaClient(c.env.DB)
    const service = new ProjectService(prisma)
    
    try {
      const item = await service.updateItem(itemId, data)
      return c.json({
        success: true,
        data: item,
      })
    } catch (error) {
      console.error('Update item error:', error)
      return c.json({
        success: false,
        error: 'Failed to update item',
      }, 500)
    }
  }
)

projects.delete('/:projectId/items/:itemId',
  validateParam(z.object({ projectId: z.string().uuid(), itemId: z.string().uuid() })),
  async (c) => {
    const { itemId } = c.req.valid('param')
    const prisma = createPrismaClient(c.env.DB)
    const service = new ProjectService(prisma)
    
    try {
      await service.deleteItem(itemId)
      return c.json({
        success: true,
        message: 'Item deleted successfully',
      })
    } catch (error) {
      console.error('Delete item error:', error)
      return c.json({
        success: false,
        error: 'Failed to delete item',
      }, 500)
    }
  }
)

export { projects }