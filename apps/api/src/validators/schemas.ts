import { z } from 'zod'

// Project schemas
export const CreateProjectSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().optional(),
})

export const UpdateProjectSchema = z.object({
  title: z.string().optional(),
  lastAccessedAt: z.string().datetime().optional(),
})

// Item schemas
export const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  order: z.number().int().min(0),
})

export const UpdateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
})

// Image upload schema
export const ImageUploadSchema = z.object({
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
})

// Query schemas
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
export type CreateItemInput = z.infer<typeof CreateItemSchema>
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>
export type ImageUploadInput = z.infer<typeof ImageUploadSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>