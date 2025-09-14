// Image configuration constants

export const IMAGE_CONFIG = {
  // Template image dimensions (in pixels)
  TEMPLATE_IMAGE_SIZE: {
    width: 320,
    height: 320,
  },
  
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Supported formats
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'] as const,
  
  // Cloudflare Images API configuration
  CLOUDFLARE_IMAGES: {
    // Resize variants for different use cases
    VARIANTS: {
      thumbnail: { width: 100, height: 100, fit: 'cover' },
      template: { width: 320, height: 320, fit: 'cover' },
      preview: { width: 640, height: 640, fit: 'cover' },
    },
    
    // Image quality settings
    QUALITY: 85,
    
    // Format preferences
    OUTPUT_FORMAT: 'webp' as const,
  },
} as const

export type ImageVariant = keyof typeof IMAGE_CONFIG.CLOUDFLARE_IMAGES.VARIANTS
export type AllowedImageFormat = typeof IMAGE_CONFIG.ALLOWED_FORMATS[number]