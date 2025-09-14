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
  itemId: z.string().min(1),  // itemIdは一時的なIDも許可
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
    const imageService = new ImageService(prisma, c.env.R2, c.env)
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

// Move temp image to actual item
images.post('/:projectId/items/:itemId/move-from-temp', validateParam(ImageParamSchema), async (c) => {
  const { projectId, itemId } = c.req.valid('param')
  
  try {
    const formData = await c.req.formData()
    const tempItemId = formData.get('tempItemId') as string
    
    if (!tempItemId) {
      return c.json({
        success: false,
        error: 'Temporary item ID is required',
      }, 400)
    }

    const prisma = createPrismaClient(c.env.DB)
    const imageService = new ImageService(prisma, c.env.R2, c.env)
    
    // 一時画像を実際のアイテムに移動
    const imageUrl = await imageService.moveTempImageToItem(projectId, tempItemId, itemId)
    
    return c.json({
      success: true,
      data: {
        imageUrl,
      },
    })
  } catch (error) {
    console.error('Move temp image error:', error)
    
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: error.message,
      }, 400)
    }
    
    return c.json({
      success: false,
      error: 'Failed to move temp image',
    }, 500)
  }
})

// Delete image for item
images.delete('/:projectId/items/:itemId', validateParam(ImageParamSchema), async (c) => {
  const { projectId, itemId } = c.req.valid('param')
  
  try {
    const prisma = createPrismaClient(c.env.DB)
    const imageService = new ImageService(prisma, c.env.R2, c.env)
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

// R2 image proxy for development
images.get('/r2/:key', async (c) => {
  const key = decodeURIComponent(c.req.param('key'))
  
  try {
    const object = await c.env.R2.get(key)
    if (!object) {
      return c.notFound()
    }

    const arrayBuffer = await object.arrayBuffer()
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1年キャッシュ
      },
    })
  } catch (error) {
    console.error('R2 proxy error:', error)
    return c.json({ error: 'Failed to fetch image' }, 500)
  }
})

export { images }