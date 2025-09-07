import type { R2Bucket } from '@cloudflare/workers-types'
import type { PrismaClient } from '@prisma/client'
import { R2StorageService } from '../utils/r2'

export class ImageService {
  private r2Service: R2StorageService

  constructor(
    private db: PrismaClient,
    r2Bucket: R2Bucket
  ) {
    this.r2Service = new R2StorageService(r2Bucket)
  }

  async uploadItemImage(
    projectId: string,
    itemId: string,
    file: File
  ): Promise<string> {
    // バリデーション
    if (!this.r2Service.validateImageType(file.type)) {
      throw new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed.')
    }

    if (!this.r2Service.validateImageSize(file.size)) {
      throw new Error('Image size too large. Maximum size is 5MB.')
    }

    // アイテムが存在するか確認
    const item = await this.db.item.findFirst({
      where: {
        id: itemId,
        projectId,
      },
    })

    if (!item) {
      throw new Error('Item not found')
    }

    // 既存の画像がある場合は削除
    if (item.imageUrl) {
      const oldKey = this.extractKeyFromUrl(item.imageUrl)
      if (oldKey) {
        try {
          await this.r2Service.deleteImage(oldKey)
        } catch (error) {
          console.warn('Failed to delete old image:', error)
        }
      }
    }

    // 新しい画像をアップロード
    const extension = this.getFileExtension(file.type)
    const key = this.r2Service.generateImageKey(projectId, itemId, extension)
    
    const arrayBuffer = await file.arrayBuffer()
    const imageUrl = await this.r2Service.uploadImage(key, arrayBuffer, file.type)

    // データベースを更新
    await this.db.item.update({
      where: { id: itemId },
      data: { imageUrl },
    })

    return imageUrl
  }

  async deleteItemImage(projectId: string, itemId: string): Promise<void> {
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

    // R2から画像を削除
    const key = this.extractKeyFromUrl(item.imageUrl)
    if (key) {
      await this.r2Service.deleteImage(key)
    }

    // データベースから画像URLを削除
    await this.db.item.update({
      where: { id: itemId },
      data: { imageUrl: null },
    })
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

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.substring(1) // 先頭の '/' を除去
    } catch {
      return null
    }
  }
}