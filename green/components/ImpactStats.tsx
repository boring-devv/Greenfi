'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

const stats = [
  { label: 'Total Trees Funded', value: 125000, suffix: '+' },
  { label: 'Total Stakers', value: 3420, suffix: '+' },
  { label: 'HBAR Staked', value: 2500000, suffix: '+', prefix: '' },
  { label: 'CO₂ Offset (tons)', value: 45000, suffix: '+' },
]

export default function ImpactStats() {
  return (
    <section id="impact" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neon-green/5 to-black" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/10 rounded-full blur-[150px] animate-pulse" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-white">Our </span>
            <span className="gradient-text">Impact</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Real-time metrics showing the collective environmental impact of our community
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="glass-effect-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 hover:border-neon-green hover:shadow-[0_0_40px_rgba(0,255,136,0.5)] h-full flex flex-col justify-center">
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                <p className="text-gray-400 text-xs sm:text-sm lg:text-base mt-2 sm:mt-3">{stat.label}</p>
                
                {/* Animated Glow */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 rounded-xl sm:rounded-2xl pointer-events-none"
                />

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-neon-green/20 to-transparent rounded-tr-xl sm:rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional decorative text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-gray-500 text-sm sm:text-base">
            Updated in real-time • Verified on-chain • Transparent impact tracking
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    })

    return controls.stop
  }, [count, value])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString()}${suffix}`
      }
    })

    return () => unsubscribe()
  }, [rounded, prefix, suffix])

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-bold text-neon-green text-glow">
      {prefix}0{suffix}
    </span>
  )
}
