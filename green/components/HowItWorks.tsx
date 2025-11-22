'use client'

import { motion } from 'framer-motion'
import { Sprout, Droplet, Globe } from 'lucide-react'

const steps = [
  {
    icon: Sprout,
    title: 'Stake',
    description: 'Users stake HBAR or stable tokens to participate in climate impact funding.',
  },
  {
    icon: Droplet,
    title: 'Grow',
    description: 'Yield funds verified reforestation and climate restoration projects worldwide.',
  },
  {
    icon: Globe,
    title: 'Earn Impact',
    description: 'Receive proof-based NFT badges that track your real-world environmental impact.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-neon-green/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-white">How It </span>
            <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Three simple steps to make a real environmental impact while earning rewards
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group"
            >
              <div className="glass-effect-strong rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full transition-all duration-300 hover:border-neon-green hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] border-glow">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-neon-green/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-neon-green/30">
                  <span className="text-neon-green font-bold text-lg">{index + 1}</span>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-green/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-neon-green/50 transition-all"
                >
                  <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-neon-green" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{step.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{step.description}</p>

                {/* Animated Glow Effect on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  animate={{
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
