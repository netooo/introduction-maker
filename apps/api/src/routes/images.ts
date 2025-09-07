import { Hono } from 'hono'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { ImageService } from '../services/image.service'
import { validateParam } from '../middleware/validation'

type Bindings = {
  DB: D1Database
  R2: R2Bucket
}

const images = new Hono<{ Bindings: Bindings }>()

// Helper function to create Prisma client
function createPrismaClient(db: D1Database) {
  const adapter = new PrismaD1(db)
  return new PrismaClient({ adapter })
}

// Param validation schema
const ImageParamSchema = z.object({
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
})

// Upload image for item
images.post('/:projectId/items/:itemId', validateParam(ImageParamSchema), async (c) => {
  const { projectId, itemId } = c.req.valid('param')
  
  try {
    const formData = await c.req.formData()
    const fileData = formData.get('image')
    
    if (!fileData || typeof fileData === 'string') {
      return c.json({
        success: false,
        error: 'No image file provided',
      }, 400)
    }

    const file = fileData as File

    const prisma = createPrismaClient(c.env.DB)
    const imageService = new ImageService(prisma, c.env.R2)
    const imageUrl = await imageService.uploadItemImage(projectId, itemId, file)
    
    return c.json({
      success: true,
      data: {
        imageUrl,
      },
    })
  } catch (error) {
    console.error('Upload image error:', error)
    
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: error.message,
      }, 400)
    }
    
    return c.json({
      success: false,
      error: 'Failed to upload image',
    }, 500)
  }
})

// Delete image for item
images.delete('/:projectId/items/:itemId', validateParam(ImageParamSchema), async (c) => {
  const { projectId, itemId } = c.req.valid('param')
  
  try {
    const prisma = createPrismaClient(c.env.DB)
    const imageService = new ImageService(prisma, c.env.R2)
    await imageService.deleteItemImage(projectId, itemId)
    
    return c.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Delete image error:', error)
    
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: error.message,
      }, 400)
    }
    
    return c.json({
      success: false,
      error: 'Failed to delete image',
    }, 500)
  }
})

export { images }