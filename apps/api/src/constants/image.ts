export const IMAGE_CONFIG = {
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  QUALITY: 85,
} as const

export type AllowedFormat = typeof IMAGE_CONFIG.ALLOWED_FORMATS[number]