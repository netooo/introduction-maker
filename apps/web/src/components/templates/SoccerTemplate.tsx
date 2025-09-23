'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TemplateBase, type TemplateProps } from './TemplateBase'

const soccerAnimations = {
  container: {
    hidden: { 
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  },

  item: {
    hidden: { 
      scale: 0.8,
      opacity: 0.3
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        duration: 0.6
      }
    }
  },
  
  image: {
    hidden: { 
      scale: 0.7,
      opacity: 0,
      rotate: -10
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
        duration: 0.8
      }
    }
  },
  
  text: {
    hidden: { 
      y: 5,
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: 0.2
      }
    }
  }
}

// 参考画像に合わせた選手配置とポジション情報
const soccerPositions = [
  { x: 47.5, y: 15, position: 'GK' },   // 1 GK - キーパー
  { x: 29, y: 30, position: 'DF' },     // 2 DF (左CB)
  { x: 40.5, y: 30, position: 'DF' },   // 6 DF (中央CB)
  { x: 54, y: 30, position: 'DF' },     // 5 DF (中央CB)
  { x: 65.5, y: 30, position: 'DF' },   // 3 DF (右CB)
  { x: 33.5, y: 51, position: 'MF' },   // 8 MF (左MF)
  { x: 47.5, y: 51, position: 'MF' },   // 44 MF (中央MF)
  { x: 61, y: 51, position: 'MF' },     // 18 MF (右MF)
  { x: 33.5, y: 70, position: 'FW' },   // 7 FW (左ウィング)
  { x: 47.5, y: 70, position: 'FW' },   // 14 FW (センターフォワード)
  { x: 61, y: 70, position: 'FW' },     // 29 FW (右ウィング)
]

// ポジション別のグループ分け
const positionGroups = {
  'GK': [0],           // Goalkeeper
  'DF': [1, 2, 3, 4],  // Defence
  'MF': [5, 6, 7],     // Midfield
  'FW': [8, 9, 10]     // Forward
}

const groupOrder = ['GK', 'DF', 'MF', 'FW']

// ポジション名の表示用マッピング
const positionNames = {
  'GK': 'Goalkeeper',
  'DF': 'Defence',
  'MF': 'Midfield',
  'FW': 'Forwards'
}

export const SoccerTemplate: React.FC<TemplateProps> = (props) => {
  const { currentIndex, items, isPlaying, isPaused = false, hasPlayedOnce = false, isEditMode = false, onItemClick, selectedIndex } = props

  // currentIndexを4つのグループに対応させる (0-2=GK, 3-5=DF, 6-8=MF, 9-10=FW)
  const getCurrentGroupFromIndex = (index: number): string => {
    if (index <= 2) return 'GK'
    if (index <= 5) return 'DF'
    if (index <= 8) return 'MF'
    return 'FW'
  }

  const currentGroup = getCurrentGroupFromIndex(currentIndex)
  const currentGroupIndices = positionGroups[currentGroup as keyof typeof positionGroups] || []

  // 一度表示されたグループを追跡
  const [shownGroups, setShownGroups] = React.useState<Set<string>>(new Set())

  // 前回のcurrentIndexを追跡
  const [previousIndex, setPreviousIndex] = React.useState<number | null>(null)

  // 各グループのアニメーション完了状態を追跡
  const [animatedGroups, setAnimatedGroups] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (currentGroup) {
      setShownGroups(prev => new Set(prev).add(currentGroup))
    }
  }, [currentGroup])

  // currentIndexが変更された時のみアニメーション開始
  const isNewIndex = previousIndex !== currentIndex

  React.useEffect(() => {
    if (isPlaying && !isPaused) {
      setPreviousIndex(currentIndex)
    }
  }, [currentIndex, isPlaying, isPaused])

  // プレイ状態がリセットされた時にアニメーション状態をリセット
  React.useEffect(() => {
    if (!isPlaying && !hasPlayedOnce) {
      setAnimatedGroups(new Set())
      setShownGroups(new Set())
      setPreviousIndex(null)
    }
  }, [isPlaying, hasPlayedOnce])

  // アニメーション完了時の処理
  const handleAnimationComplete = React.useCallback(() => {
    setAnimatedGroups(prev => new Set(prev).add(currentGroup))
  }, [currentGroup])

  // プレースホルダーアイテムを11個作成（アイテムが少ない場合）
  const displayItems = React.useMemo(() => {
    const placeholderItems = Array(11).fill(null).map((_, index) => ({
      id: `placeholder-${index}`,
      name: `選手 ${index + 1}`,
      description: '',
      imageUrl: '',
      order: index
    }))

    // 実際のアイテムで上書き
    items.forEach((item, index) => {
      if (index < 11) {
        placeholderItems[index] = item
      }
    })
    
    return placeholderItems
  }, [items])
  
  return (
    <motion.div 
      className="absolute inset-0 bg-white overflow-hidden"
      variants={soccerAnimations.container}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Soccer Field Background - Perspective view */}
      <div className="absolute inset-0 flex items-center justify-start">
        {/* Main Field Area with perspective effect - shifted left */}
        <div className="relative w-[85%] h-full ml-8">
          {/* Field with trapezoid shape (perspective effect) - starts from 10% from top with rounded corners */}
          <div
            className="relative bg-gray-200"
            style={{
              clipPath: 'polygon(25% 10%, 75% 10%, 100% 100%, 0% 100%)',
              height: '90%',
              top: '10%',
              borderRadius: '12px'
            }}
          >
            
            {/* Center Line - simple horizontal line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white transform -translate-y-1/2" />
            
            {/* Center Circle - very large oval shape (horizontally stretched) */}
            <div 
              className="absolute left-1/2 top-1/2 border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '300px',
                height: '180px',
                borderRadius: '50%'
              }}
            />
            <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            
            {/* Top Goal Area - upper field (far end) */}

            {/* Top Penalty Area - angled lines parallel to goal area, adjusted height */}
            <div className="absolute bg-white h-0.5 rounded-full" style={{ top: '22%', left: '33.5%', width: '33%' }} />
            <svg className="absolute inset-0" style={{ top: '10%', width: '100%', height: '14%' }}>
              <line x1="35%" y1="0%" x2="33.5%" y2="86%" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="65%" y1="0%" x2="66.5%" y2="86%" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>

            {/* Top Goal Area - slightly angled lines, adjusted height */}
            <div className="absolute bg-white h-0.5 rounded-full" style={{ top: '14%', left: '42.7%', width: '14.6%' }} />
            <svg className="absolute inset-0" style={{ top: '10%', width: '100%', height: '5%' }}>
              <line x1="43%" y1="0%" x2="42.7%" y2="80%" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="57%" y1="0%" x2="57.3%" y2="80%" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>


            {/* Top Penalty Arc - elliptical arc, upward curve, wider */}
            <svg
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{ top: '22%', width: '200px', height: '60px' }}
              viewBox="0 0 200 60"
            >
              <path
                d="M 10 0 A 95 50 0 0 0 190 0"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </svg>

          </div>
          
          {/* Players positioned on the field */}
          {displayItems.map((item, index) => {
            const position = soccerPositions[index] || { x: 50, y: 50, position: 'FW' }
            const isInCurrentGroup = !isEditMode && currentGroupIndices.includes(index) && (isPlaying || hasPlayedOnce)
            const hasRealData = items[index] !== undefined
            const playerPosition = soccerPositions[index]?.position || 'FW'
            const hasBeenShown = shownGroups.has(playerPosition)
            const isSelected = isEditMode && selectedIndex === index

            // グループ内での位置計算
            const groupIndex = isInCurrentGroup ? currentGroupIndices.indexOf(index) : -1
            const groupSize = currentGroupIndices.length

            // 両端の選手は少し小さくする
            const getScaleMultiplier = () => {
              if (!isInCurrentGroup || groupSize === 1) return 1.0

              // 3人以上の場合、両端を少し小さくする
              if (groupIndex === 0 || groupIndex === groupSize - 1) {
                return 0.9 // 両端は90%のサイズ
              }
              return 1.0 // 中央は通常サイズ
            }

            const scaleMultiplier = getScaleMultiplier()

            // 横並び配置の計算
            const getHorizontalPosition = () => {
              if (!isInCurrentGroup) return position.x

              if (groupSize === 1) return 46 // 1人の場合は中央

              // 複数人の場合は等間隔で配置（間隔をさらに広げる）
              const spacing = Math.min(22, 55 / (groupSize - 1)) // 最大22%間隔、全体幅70%
              const startX = 46 - (spacing * (groupSize - 1)) / 2
              return startX + spacing * groupIndex
            }

            const horizontalPosition = getHorizontalPosition()

            // 遠近法効果：上部（遠い）の選手は小さく、下部（近い）の選手は大きく
            const perspectiveScale = 0.7 + (position.y / 100) * 0.5 // 0.7から1.2の範囲
            
            return (
              <motion.div
                key={item.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isEditMode ? 'cursor-pointer transition-all duration-200' : ''}`}
                style={{
                  left: isEditMode ? `${(isInCurrentGroup ? horizontalPosition : position.x) - 1}%` : isInCurrentGroup ? `${horizontalPosition}%` : `${position.x}%`,
                  top: isInCurrentGroup ? '48%' : `${position.y}%`,
                  zIndex: isEditMode && isSelected ? 50 : isInCurrentGroup ? 30 : 20
                }}
                animate={isEditMode ? {
                  x: `0%`,
                  y: `0%`,
                  scale: isSelected ? perspectiveScale * 1.1 : perspectiveScale,
                  opacity: 1,
                  rotateY: 0,
                  transition: { duration: 0.3, ease: 'easeOut' }
                } : (isInCurrentGroup && isPlaying && !isPaused && isNewIndex && !animatedGroups.has(currentGroup)) ? {
                  x: `${horizontalPosition - position.x}%`,
                  y: `${48 - position.y}%`,
                  scale: 2.0 * scaleMultiplier,
                  opacity: 1,
                  rotateY: 180,
                  transition: {
                    duration: 1,
                    ease: 'easeOut',
                    onComplete: handleAnimationComplete
                  }
                } : isInCurrentGroup && (isPlaying || hasPlayedOnce) ? {
                  x: `${horizontalPosition - position.x}%`,
                  y: `${48 - position.y}%`,
                  scale: 2.0 * scaleMultiplier,
                  opacity: 1,
                  rotateY: 180,
                  transition: { duration: 0.3, ease: 'easeOut' }
                } : {
                  x: `0%`,
                  y: `0%`,
                  scale: perspectiveScale,
                  opacity: 0.6,
                  rotateY: 0,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
                onClick={isEditMode && onItemClick ? (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onItemClick(index)
                } : undefined}
                whileHover={isEditMode ? { scale: perspectiveScale * 1.05 } : undefined}
              >
{isEditMode ? (
                  /* Edit mode: Always show small yellow cards */
                  <div className={`${isSelected ? 'bg-blue-400 ring-4 ring-blue-200' : 'bg-yellow-300'} rounded-lg shadow-lg p-2 w-24 h-36 text-center flex flex-col relative transition-all duration-200 hover:shadow-xl`}>

                    {/* Player Image */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{
                            background: 'transparent',
                            mixBlendMode: 'multiply'
                          }}
                        />
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div
                            className="text-7xl text-black leading-none"
                            style={{
                              transform: 'scaleY(1.2)',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontWeight: '900',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Player Name */}
                    {hasRealData && item.name && (
                      <div className="text-xs font-bold text-black truncate leading-none mt-1">
                        {item.name.split(' ')[0]}
                      </div>
                    )}
                  </div>
                ) : isInCurrentGroup ? (
                  /* Large focused player card for current group - compensate for Y rotation */
                  <div
                    className="bg-yellow-300 rounded-2xl shadow-2xl p-4 w-36 h-56 text-center transform flex flex-col relative"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    {/* Jersey Number - moved to top-left corner with transparent background */}
                    <div className="absolute top-1 left-1 text-6xl font-black leading-none text-transparent" style={{ WebkitTextStroke: '1px #6b7280' }}>
                      {index + 1}
                    </div>

                    {/* Player Image - full card size */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{
                            background: 'transparent',
                            mixBlendMode: 'multiply'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-transparent flex items-center justify-center ">
                        </div>
                      )}
                    </div>

                    {/* Player Name */}
                    <div className="text-sm font-black text-black leading-tight mt-2">
                      {hasRealData ? item.name : `選手 ${index + 1}`}
                    </div>
                  </div>
                ) : (
                  /* Small yellow card for other groups */
                  <div className="bg-yellow-300 rounded-lg shadow-lg p-2 w-24 h-36 text-center flex flex-col relative">

                    {/* Small Player Image - only show if group has been displayed */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg">
                      {hasBeenShown && item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{
                            background: 'transparent',
                            mixBlendMode: 'multiply'
                          }}
                        />
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div
                            className="text-7xl text-black leading-none"
                            style={{
                              transform: 'scaleY(1.2)',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontWeight: '900',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Player Name - positioned at bottom */}
                    {hasRealData && (
                      <div className="text-xs font-bold text-black truncate leading-none mt-1">
                        {item.name.split(' ')[0]}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

{!isEditMode && (
          /* Position Area - Right side with position name display */
          <div className="absolute right-0 top-0 w-[15%] h-full bg-yellow-400 flex flex-col items-center justify-center" style={{ borderRadius: '60px 0 0 60px' }}>
            {/* Position Name Display - Vertical with slide in/out animation */}
            <div className="text-center relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGroup}
                  className="text-white font-extrabold"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    fontSize: '10rem',
                  }}
                  initial={{ y: -300, rotate: 180 }}
                  animate={{
                    y: 0,
                    rotate: 180,
                    transition: {
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }}
                  exit={{
                    y: 1200,
                    rotate: 180,
                    transition: {
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }}
                >
                  {positionNames[currentGroup as keyof typeof positionNames]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}