'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Item, Template } from '@/types'

export interface TemplateProps {
  template: Template
  items: Item[]
  currentIndex: number
  isPlaying: boolean
  onItemChange?: (index: number) => void
}

export interface AnimationConfig {
  container: any
  item: any
  text: any
  image: any
}

export const TemplateBase: React.FC<TemplateProps & { 
  animationConfig: AnimationConfig 
  children?: React.ReactNode 
}> = ({ 
  template, 
  items, 
  currentIndex, 
  isPlaying, 
  animationConfig,
  children
}) => {
  const currentItem = items[currentIndex]

  // Allow templates to render even without items (for placeholder support)
  // if (!currentItem) return null

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_50%)]" />
      </div>

      {/* Template Specific Background */}
      {children}

      <AnimatePresence mode="wait">
        {isPlaying && currentItem && (
          <motion.div
            key={currentIndex}
            variants={animationConfig.container}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center min-h-screen"
          >
            <div className="text-center max-w-4xl mx-auto px-8">
              {/* Image */}
              <motion.div
                variants={animationConfig.image}
                className="mb-8 mx-auto"
              >
                <div className="relative w-80 h-80 mx-auto">
                  {currentItem.imageUrl ? (
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.name}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-2xl border-4 border-white/20 flex items-center justify-center">
                      <div className="text-gray-400 text-lg font-medium">No Image</div>
                    </div>
                  )}
                  
                  {/* Glowing effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse" />
                </div>
              </motion.div>

              {/* Text Content */}
              <motion.div variants={animationConfig.text}>
                <h1 className="text-6xl font-bold text-white mb-6 tracking-wide">
                  {currentItem.name}
                </h1>
                
                <p className="text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {currentItem.description}
                </p>

                {/* Progress indicator */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg text-gray-400">
                    {currentIndex + 1} / {items.length}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      {isPlaying && (
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1 bg-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </div>
  )
}