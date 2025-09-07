'use client'

import { motion } from 'framer-motion'
import { TemplateBase, type TemplateProps } from './TemplateBase'

const soccerAnimations = {
  container: {
    hidden: { 
      opacity: 0,
      scale: 0.8 
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.5
      }
    }
  },

  item: {
    hidden: { 
      scale: 0.9,
      opacity: 0 
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  },
  
  image: {
    hidden: { 
      scale: 0.3,
      rotate: -180,
      opacity: 0 
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        duration: 1.2
      }
    }
  },
  
  text: {
    hidden: { 
      y: 50,
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  }
}

// サッカーフィールドのポジション（11人制フォーメーション）
const soccerPositions = [
  { x: 10, y: 50 },   // GK
  { x: 25, y: 20 },   // DF
  { x: 25, y: 40 },   // DF
  { x: 25, y: 60 },   // DF
  { x: 25, y: 80 },   // DF
  { x: 50, y: 30 },   // MF
  { x: 50, y: 50 },   // MF
  { x: 50, y: 70 },   // MF
  { x: 75, y: 25 },   // FW
  { x: 75, y: 50 },   // FW
  { x: 75, y: 75 },   // FW
]

export const SoccerTemplate: React.FC<TemplateProps> = (props) => {
  const { currentIndex, items } = props
  
  return (
    <TemplateBase {...props} animationConfig={soccerAnimations}>
      {/* Soccer Field Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Field */}
        <div className="absolute inset-4 border-2 border-green-400/30 bg-gradient-to-b from-green-900/40 to-green-800/40 rounded-lg">
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-400/30 rounded-full" />
          
          {/* Center Line */}
          <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-green-400/30" />
          
          {/* Goal Areas */}
          <div className="absolute top-1/3 bottom-1/3 left-0 w-16 border-r-2 border-green-400/30" />
          <div className="absolute top-1/3 bottom-1/3 right-0 w-16 border-l-2 border-green-400/30" />
        </div>
        
        {/* Formation Dots */}
        {soccerPositions.map((pos, index) => (
          <motion.div
            key={index}
            className={`absolute w-3 h-3 rounded-full transition-all duration-500 ${
              index === currentIndex 
                ? 'bg-blue-500 shadow-lg shadow-blue-500/50 scale-150' 
                : 'bg-green-400/50'
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={index === currentIndex ? {
              scale: [1.5, 2, 1.5],
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.5)',
                '0 0 30px rgba(59, 130, 246, 0.8)',
                '0 0 20px rgba(59, 130, 246, 0.5)'
              ]
            } : {}}
            transition={{
              repeat: index === currentIndex ? Infinity : 0,
              duration: 2
            }}
          />
        ))}
      </div>

      {/* Dynamic Stadium Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floodlights effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-300/10 via-yellow-300/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-radial from-yellow-300/10 via-yellow-300/5 to-transparent rounded-full blur-3xl" />
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -50, -10],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </TemplateBase>
  )
}