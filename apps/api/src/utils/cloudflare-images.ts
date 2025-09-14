import { IMAGE_CONFIG, type ImageVariant } from '@introduction-maker/shared'

// Cloudflare Images API utility functions

export interface CloudflareImagesConfig {
  accountId: string
  apiToken: string
}

export interface UploadImageOptions {
  file: File | Blob | ArrayBuffer
  filename: string
  metadata?: Record<string, string>
  requireSignedURLs?: boolean
}

export interface ResizeImageOptions {
  imageId: string
  variant?: ImageVariant
  width?: number
  height?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
}

export class CloudflareImagesService {
  private config: CloudflareImagesConfig

  constructor(config: CloudflareImagesConfig) {
    this.config = config
  }

  /**
   * Upload image to Cloudflare Images with automatic resizing
   */
  async uploadImage(options: UploadImageOptions): Promise<{
    id: string
    filename: string
    uploaded: string
    requireSignedURLs: boolean
    variants: string[]
  }> {
    const formData = new FormData()
    
    if (options.file instanceof ArrayBuffer) {
      formData.append('file', new Blob([options.file]), options.filename)
    } else {
      formData.append('file', options.file, options.filename)
    }

    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }

    if (options.requireSignedURLs !== undefined) {
      formData.append('requireSignedURLs', String(options.requireSignedURLs))
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Cloudflare Images upload failed: ${error}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(`Cloudflare Images upload failed: ${result.errors?.join(', ') || 'Unknown error'}`)
    }

    return result.result
  }

  /**
   * Get optimized image URL with resizing parameters
   */
  getImageUrl(imageId: string, options: ResizeImageOptions = {}): string {
    const baseUrl = `https://imagedelivery.net/${this.config.accountId}/${imageId}`
    
    // If using predefined variant
    if (options.variant) {
      return `${baseUrl}/${options.variant}`
    }

    // Build custom resize parameters
    const params = new URLSearchParams()
    
    if (options.width) params.append('width', String(options.width))
    if (options.height) params.append('height', String(options.height))
    if (options.fit) params.append('fit', options.fit)
    if (options.quality) params.append('quality', String(options.quality))
    if (options.format) params.append('format', options.format)

    const queryString = params.toString()
    return queryString ? `${baseUrl}/public?${queryString}` : `${baseUrl}/public`
  }

  /**
   * Delete image from Cloudflare Images
   */
  async deleteImage(imageId: string): Promise<boolean> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Cloudflare Images delete failed: ${error}`)
    }

    const result = await response.json()
    return result.success
  }

  /**
   * Get template-optimized image URL
   */
  getTemplateImageUrl(imageId: string): string {
    return this.getImageUrl(imageId, {
      variant: 'template',
    })
  }

  /**
   * Get thumbnail image URL
   */
  getThumbnailUrl(imageId: string): string {
    return this.getImageUrl(imageId, {
      variant: 'thumbnail',
    })
  }

  /**
   * Get preview image URL
   */
  getPreviewUrl(imageId: string): string {
    return this.getImageUrl(imageId, {
      variant: 'preview',
    })
  }
}

/**
 * Create Cloudflare Images service instance
 */
export function createCloudflareImagesService(env: any): CloudflareImagesService | null {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = env.CLOUDFLARE_IMAGES_API_TOKEN

  if (!accountId || !apiToken) {
    console.warn('Cloudflare Images not configured - using R2 direct upload')
    return null
  }

  return new CloudflareImagesService({
    accountId,
    apiToken,
  })
}