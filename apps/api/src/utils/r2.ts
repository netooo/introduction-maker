import type { R2Bucket } from '@cloudflare/workers-types'

export class R2StorageService {
  public bucket: R2Bucket
  public env?: any
  
  constructor(
    bucket: R2Bucket, 
    env?: any
  ) {
    this.bucket = bucket
    this.env = env
  }

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
      
      // 開発環境ではローカルAPIサーバー経由でR2画像を提供
      const baseUrl = this.getBaseUrl()
      return `${baseUrl}/api/images/r2/${encodeURIComponent(key)}`
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
        const baseUrl = this.getBaseUrl()
        return `${baseUrl}/api/images/r2/${encodeURIComponent(key)}`
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

  private getBaseUrl(): string {
    // 本番環境では環境変数から取得
    if (this.env?.API_BASE_URL) {
      return this.env.API_BASE_URL
    }
    
    // 開発環境のデフォルト
    return 'http://localhost:8787'
  }
}