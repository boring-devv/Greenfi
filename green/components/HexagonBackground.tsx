'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HexagonBackground() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated Hexagon Grid */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          const randomX = (Math.random() * dimensions.width) % dimensions.width
          const randomY1 = (Math.random() * dimensions.height) % dimensions.height
          const randomY2 = (Math.random() * dimensions.height) % dimensions.height
          const randomY3 = (Math.random() * dimensions.height) % dimensions.height
          
          return (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: randomX,
                y: randomY1,
                opacity: 0,
              }}
              animate={{
                y: [randomY1, randomY2, randomY3],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.2,
              }}
            >
              <HexagonOutline size={40 + Math.random() * 80} />
            </motion.div>
          )
        })}
      </div>

      {/* Gradient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] animate-pulse delay-1000" />
    </div>
  )
}

function HexagonOutline({ size }: { size: number }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const x = size / 2 + (size / 2) * Math.cos(angle)
    const y = size / 2 + (size / 2) * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={size} height={size} className="opacity-30">
      <polygon
        points={points}
        fill="transparent"
        stroke="#00FF88"
        strokeWidth="1"
        className="drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]"
      />
    </svg>
  )
}
