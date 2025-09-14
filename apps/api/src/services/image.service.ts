import type { R2Bucket } from '@cloudflare/workers-types'
import type { PrismaClient } from '@prisma/client'
import { R2StorageService } from '../utils/r2'
import { createCloudflareImagesService } from '../utils/cloudflare-images'
import { IMAGE_CONFIG } from '@introduction-maker/shared'

export class ImageService {
  private r2Service: R2StorageService
  private cloudflareImages: any

  constructor(
    private db: PrismaClient,
    r2Bucket: R2Bucket,
    env: any
  ) {
    this.r2Service = new R2StorageService(r2Bucket, env)
    this.cloudflareImages = createCloudflareImagesService(env)
  }

  async uploadItemImage(
    projectId: string,
    itemId: string,
    file: File
  ): Promise<string> {
    console.log(`Upload image for project ${projectId}, item ${itemId}`)
    
    // Validate image format and size
    if (!IMAGE_CONFIG.ALLOWED_FORMATS.includes(file.type as any)) {
      throw new Error('サポートされていないファイル形式です（JPEG、PNG、WebPのみ）')
    }

    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`ファイルサイズが大きすぎます（最大${Math.round(IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB）`)
    }

    // 一時的なIDでない場合のみアイテムの存在をチェック
    let existingImageUrl: string | null = null
    if (!itemId.startsWith('temp-')) {
      console.log(`Checking for existing item ${itemId} in project ${projectId}`)
      
      const item = await this.db.item.findFirst({
        where: {
          id: itemId,
          projectId,
        },
      })

      console.log(`Item found:`, item ? 'Yes' : 'No')

      if (!item) {
        throw new Error('Item not found')
      }

      // 既存の画像がある場合は削除
      if (item.imageUrl) {
        await this.deleteExistingImage(item.imageUrl)
        existingImageUrl = item.imageUrl
      }
    } else {
      console.log(`Skipping item validation for temp item ${itemId}`)
    }

    let imageUrl: string

    // Try Cloudflare Images first, fall back to R2 direct upload
    if (this.cloudflareImages) {
      try {
        imageUrl = await this.uploadWithCloudflareImages(projectId, itemId, file)
      } catch (error) {
        console.warn('Cloudflare Images upload failed, falling back to R2:', error)
        imageUrl = await this.uploadWithR2Direct(projectId, itemId, file)
      }
    } else {
      imageUrl = await this.uploadWithR2Direct(projectId, itemId, file)
    }

    // 一時的なIDでない場合のみデータベースを更新
    if (!itemId.startsWith('temp-')) {
      await this.db.item.update({
        where: { id: itemId },
        data: { imageUrl },
      })
    }

    return imageUrl
  }

  async deleteItemImage(projectId: string, itemId: string): Promise<void> {
    // 一時的なIDの場合は何もしない
    if (itemId.startsWith('temp-')) {
      return
    }

    // アイテムが存在するか確認
    const item = await this.db.item.findFirst({
      where: {
        id: itemId,
        projectId,
      },
    })

    if (!item || !item.imageUrl) {
      throw new Error('Item or image not found')
    }

    // 既存画像を削除
    await this.deleteExistingImage(item.imageUrl)

    // データベースから画像URLを削除
    await this.db.item.update({
      where: { id: itemId },
      data: { imageUrl: null },
    })
  }

  async moveTempImageToItem(
    projectId: string,
    tempItemId: string,
    actualItemId: string
  ): Promise<string> {
    // 実際のアイテムが存在するか確認
    const item = await this.db.item.findFirst({
      where: {
        id: actualItemId,
        projectId,
      },
    })

    if (!item) {
      throw new Error('Item not found')
    }

    // 一時的なアイテムのキーから実際のアイテムのキーに変更
    const tempKeys = [
      `items/${projectId}/${tempItemId}.jpg`,
      `items/${projectId}/${tempItemId}.png`,
      `items/${projectId}/${tempItemId}.jpeg`,
      `items/${projectId}/${tempItemId}.webp`
    ]

    let tempImageUrl: string | null = null
    let actualKey: string | null = null
    
    // 一時画像が存在するキーを探す
    for (const key of tempKeys) {
      try {
        const object = await this.r2Service.bucket.head(key)
        if (object) {
          const extension = key.split('.').pop()
          actualKey = `items/${projectId}/${actualItemId}.${extension}`
          
          // R2内で画像をコピー
          const tempObject = await this.r2Service.bucket.get(key)
          if (tempObject) {
            await this.r2Service.bucket.put(actualKey, tempObject.body, {
              httpMetadata: tempObject.httpMetadata,
            })
            
            // 一時画像を削除
            await this.r2Service.bucket.delete(key)
            
            const baseUrl = this.r2Service.env?.API_BASE_URL || 'http://localhost:8787'
            tempImageUrl = `${baseUrl}/api/images/r2/${encodeURIComponent(actualKey)}`
            break
          }
        }
      } catch (error) {
        // このキーには画像がない場合はスキップ
        continue
      }
    }

    if (!tempImageUrl) {
      throw new Error('Temp image not found')
    }

    // データベースのアイテムに画像URLを設定
    await this.db.item.update({
      where: { id: actualItemId },
      data: { imageUrl: tempImageUrl },
    })

    return tempImageUrl
  }

  private getFileExtension(contentType: string): string {
    switch (contentType) {
      case 'image/jpeg':
        return 'jpg'
      case 'image/png':
        return 'png'
      case 'image/webp':
        return 'webp'
      default:
        return 'jpg'
    }
  }

  private async uploadWithCloudflareImages(
    projectId: string,
    itemId: string,
    file: File
  ): Promise<string> {
    const result = await this.cloudflareImages.uploadImage({
      file,
      filename: `${projectId}/${itemId}.${this.getFileExtension(file.type)}`,
      metadata: {
        projectId,
        itemId,
      },
    })

    return this.cloudflareImages.getTemplateImageUrl(result.id)
  }

  private async uploadWithR2Direct(
    projectId: string,
    itemId: string,
    file: File
  ): Promise<string> {
    // Get file buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Upload directly to R2 (resizing will be handled by Cloudflare Images or client-side)
    const extension = this.getFileExtension(file.type)
    const key = `items/${projectId}/${itemId}.${extension}`
    const uploadUrl = await this.r2Service.uploadImage(key, arrayBuffer, file.type)

    return uploadUrl
  }

  private async deleteExistingImage(imageUrl: string): Promise<void> {
    try {
      // Check if it's a Cloudflare Images URL
      if (imageUrl.includes('imagedelivery.net')) {
        // Extract image ID from Cloudflare Images URL
        const imageId = this.extractCloudflareImageId(imageUrl)
        if (imageId && this.cloudflareImages) {
          await this.cloudflareImages.deleteImage(imageId)
        }
      } else {
        // It's an R2 URL, delete from R2
        const key = this.extractKeyFromUrl(imageUrl)
        if (key) {
          await this.r2Service.deleteImage(key)
        }
      }
    } catch (error) {
      console.warn('Failed to delete existing image:', error)
    }
  }

  private extractCloudflareImageId(url: string): string | null {
    try {
      // Cloudflare Images URL format: https://imagedelivery.net/{account_hash}/{image_id}/{variant}
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[2] || null // The image ID is the second path segment
    } catch {
      return null
    }
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.substring(1) // 先頭の '/' を除去
    } catch {
      return null
    }
  }
}