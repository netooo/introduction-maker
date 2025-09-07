import type { R2Bucket } from '@cloudflare/workers-types'

export class R2StorageService {
  constructor(private bucket: R2Bucket) {}

  async uploadImage(
    key: string,
    file: ArrayBuffer,
    contentType: string
  ): Promise<string> {
    try {
      await this.bucket.put(key, file, {
        httpMetadata: {
          contentType,
        },
      })
      
      // R2のパブリックURLを生成（実際の設定に応じて調整）
      return `https://pub-example.r2.dev/${key}`
    } catch (error) {
      console.error('R2 upload error:', error)
      throw new Error('Failed to upload image to R2')
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      await this.bucket.delete(key)
    } catch (error) {
      console.error('R2 delete error:', error)
      throw new Error('Failed to delete image from R2')
    }
  }

  async getImageUrl(key: string): Promise<string | null> {
    try {
      const object = await this.bucket.head(key)
      if (object) {
        return `https://pub-example.r2.dev/${key}`
      }
      return null
    } catch (error) {
      console.error('R2 get error:', error)
      return null
    }
  }

  generateImageKey(projectId: string, itemId: string, extension: string): string {
    return `projects/${projectId}/items/${itemId}/image.${extension}`
  }

  validateImageType(contentType: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    return allowedTypes.includes(contentType)
  }

  validateImageSize(size: number): boolean {
    const maxSize = 5 * 1024 * 1024 // 5MB
    return size <= maxSize
  }
}