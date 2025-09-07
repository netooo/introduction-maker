'use client'

import { motion } from 'framer-motion'
import { TemplateBase, type TemplateProps } from './TemplateBase'

const baseballAnimations = {
  container: {
    hidden: { 
      opacity: 0,
      rotateY: 90 
    },
    visible: {
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 1.0,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.15
      }
    },
    exit: {
      opacity: 0,
      rotateY: -90,
      transition: {
        duration: 0.6
      }
    }
  },

  item: {
    hidden: { 
      scale: 0.8,
      opacity: 0 
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  },
  
  image: {
    hidden: { 
      scale: 0,
      rotate: 360,
      opacity: 0 
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 80,
        duration: 1.5
      }
    }
  },
  
  text: {
    hidden: { 
      x: 100,
      opacity: 0 
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.9,
        ease: 'easeOut',
        staggerChildren: 0.12
      }
    }
  }
}

// 野球のダイヤモンドポジション（9人制）
const baseballPositions = [
  { x: 50, y: 85, label: 'P' },   // Pitcher
  { x: 55, y: 70, label: 'C' },   // Catcher
  { x: 65, y: 55, label: '1B' },  // 1st Base
  { x: 50, y: 40, label: '2B' },  // 2nd Base
  { x: 35, y: 55, label: '3B' },  // 3rd Base
  { x: 42, y: 48, label: 'SS' },  // Shortstop
  { x: 25, y: 25, label: 'LF' },  // Left Field
  { x: 50, y: 15, label: 'CF' },  // Center Field
  { x: 75, y: 25, label: 'RF' },  // Right Field
]

export const BaseballTemplate: React.FC<TemplateProps> = (props) => {
  const { currentIndex } = props
  
  return (
    <TemplateBase {...props} animationConfig={baseballAnimations}>
      {/* Baseball Diamond Background */}
      <div className="absolute inset-0 opacity-25">
        {/* Infield Diamond */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="w-96 h-96 border-2 border-amber-400/40 bg-gradient-to-br from-amber-900/20 to-amber-800/10"
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }}
          />
        </div>

        {/* Pitcher Mound */}
        <div className="absolute top-3/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-amber-600/30 rounded-full border border-amber-400/40" />

        {/* Home Plate */}
        <div className="absolute bottom-1/5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/60 rotate-45" />

        {/* Bases */}
        <div className="absolute top-2/5 right-1/3 w-3 h-3 bg-white/60 rotate-45" />
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/60 rotate-45" />
        <div className="absolute top-2/5 left-1/3 w-3 h-3 bg-white/60 rotate-45" />

        {/* Outfield Arc */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-amber-400/20 rounded-t-full"
          style={{ 
            width: '600px', 
            height: '300px',
            marginTop: '-50px' 
          }}
        />
      </div>

      {/* Position Indicators */}
      <div className="absolute inset-0">
        {baseballPositions.map((pos, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                index === currentIndex 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-150' 
                  : 'bg-amber-500/60 text-amber-100'
              }`}
              animate={index === currentIndex ? {
                scale: [1.5, 2.2, 1.5],
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.6)',
                  '0 0 35px rgba(239, 68, 68, 0.9)',
                  '0 0 20px rgba(239, 68, 68, 0.6)'
                ]
              } : {}}
              transition={{
                repeat: index === currentIndex ? Infinity : 0,
                duration: 1.8
              }}
            >
              {pos.label}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Stadium Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stadium Lights */}
        <div className="absolute top-5 left-10 w-64 h-64 bg-gradient-radial from-yellow-200/15 via-yellow-200/8 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-5 right-10 w-64 h-64 bg-gradient-radial from-yellow-200/15 via-yellow-200/8 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-amber-300/12 via-amber-300/6 to-transparent rounded-full blur-3xl" />

        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400/40 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [-5, -25, -5],
              x: [-5, 5, -5],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 2.5 + Math.random() * 1.5,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}

        {/* Baseball Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      </div>
    </TemplateBase>
  )
}