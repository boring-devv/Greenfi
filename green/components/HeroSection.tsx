'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/button'
import HexagonBackground from './HexagonBackground'

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20 animated-gradient">
      {/* Animated Background */}
      <HexagonBackground />
      
      {/* Multiple Gradient Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
      
      {/* Radial glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-neon-green/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold leading-tight"
            >
              <span className="text-white">Stake Green,</span>
              <br />
              <span className="gradient-text text-glow-subtle">Earn Impact.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Stake your HBAR to fund verified climate projects and earn traceable impact NFTs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto w-full sm:w-auto animate-glow shadow-2xl shadow-neon-green/50">
                  Get Started
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto w-full sm:w-auto border-2">
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto lg:mx-0"
            >
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-neon-green">125K+</div>
                <div className="text-xs sm:text-sm text-gray-400">Trees Funded</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-neon-green">3.4K+</div>
                <div className="text-xs sm:text-sm text-gray-400">Stakers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-neon-green">2.5M+</div>
                <div className="text-xs sm:text-sm text-gray-400">HBAR Staked</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Abstract Hexagon Pattern */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden md:flex items-center justify-center relative"
          >
            <div className="relative w-full h-[500px]">
              {/* Large Central Hexagon */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Hexagon size={200} className="border-neon-green border-2 glow-green" />
              </motion.div>

              {/* Floating Hexagons */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 180, 360],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                  className="absolute"
                  style={{
                    top: `${20 + (i * 15)}%`,
                    left: `${10 + (i * 12)}%`,
                  }}
                >
                  <Hexagon size={60 + i * 10} className="border-neon-green/50 border" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Hexagon SVG Component
function Hexagon({ size, className }: { size: number; className?: string }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const x = size / 2 + (size / 2) * Math.cos(angle)
    const y = size / 2 + (size / 2) * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={size} height={size} className={className}>
      <polygon points={points} fill="transparent" />
    </svg>
  )
}
