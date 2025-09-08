'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploaderProps {
  projectId: string
  itemId: string
  currentImageUrl?: string
  onImageUpload: (imageUrl: string) => void
  onImageDelete: () => void
  disabled?: boolean
  className?: string
}

interface FileValidationResult {
  isValid: boolean
  error?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  projectId,
  itemId,
  currentImageUrl,
  onImageUpload,
  onImageDelete,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): FileValidationResult => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'ファイルサイズが大きすぎます（最大5MB）'
      }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'サポートされていないファイル形式です（JPEG、PNG、WebPのみ）'
      }
    }

    return { isValid: true }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`/api/images/${projectId}/items/${itemId}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'アップロードに失敗しました')
    }

    const data = await response.json()
    return data.data.imageUrl
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return

    const file = files[0]
    const validation = validateFile(file)

    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload to server
      const imageUrl = await uploadImage(file)
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
      
      // Update with server URL
      setPreview(imageUrl)
      onImageUpload(imageUrl)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'アップロードに失敗しました')
      setPreview(currentImageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }, [projectId, itemId, currentImageUrl, onImageUpload, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect, disabled])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const handleDeleteImage = useCallback(async () => {
    if (!currentImageUrl || disabled) return

    setIsUploading(true)
    try {
      const response = await fetch(`/api/images/${projectId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('画像の削除に失敗しました')
      }

      setPreview(null)
      onImageDelete()
    } catch (error) {
      console.error('Delete error:', error)
      setError(error instanceof Error ? error.message : '画像の削除に失敗しました')
    } finally {
      setIsUploading(false)
    }
  }, [projectId, itemId, currentImageUrl, onImageDelete, disabled])

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="image-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <button
                  onClick={openFileDialog}
                  disabled={disabled || isUploading}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteImage}
                  disabled={disabled || isUploading}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`
              relative w-full aspect-square border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <ImageIcon className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              
              <p className={`text-sm font-medium mb-2 ${isDragging ? 'text-blue-700' : 'text-gray-700'}`}>
                {isDragging ? 'ファイルをドロップ' : '画像をアップロード'}
              </p>
              
              <p className="text-xs text-gray-500">
                ドラッグ&ドロップまたはクリックして選択
              </p>
              
              <p className="text-xs text-gray-400 mt-2">
                JPEG、PNG、WebP（最大5MB）
              </p>
            </div>

            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-10 left-0 right-0 flex items-center justify-center"
          >
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}