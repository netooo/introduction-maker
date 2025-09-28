// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProjectData {
  id: string
  templateId: string
  items: Array<{
    id: string
    name: string
    imageUrl: string
    description: string
    order: number
  }>
  createdAt: string
  lastAccessedAt: string
}

export interface ImageUploadResponse {
  imageUrl: string
}