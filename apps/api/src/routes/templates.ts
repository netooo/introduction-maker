import { Hono } from 'hono'
import { TEMPLATE_LIST } from '@introduction-maker/shared'

const templates = new Hono()

// Get all templates
templates.get('/', async (c) => {
  try {
    return c.json({
      success: true,
      data: TEMPLATE_LIST,
    })
  } catch (error) {
    console.error('Get templates error:', error)
    return c.json({
      success: false,
      error: 'Failed to get templates',
    }, 500)
  }
})

// Get specific template
templates.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const template = TEMPLATE_LIST.find(t => t.id === id)
    
    if (!template) {
      return c.json({
        success: false,
        error: 'Template not found',
      }, 404)
    }
    
    return c.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Get template error:', error)
    return c.json({
      success: false,
      error: 'Failed to get template',
    }, 500)
  }
})

export { templates }