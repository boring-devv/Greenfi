'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Shield, Leaf, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Verified Projects',
    description: 'All climate projects are verified and tracked on-chain',
  },
  {
    icon: Leaf,
    title: 'Real Impact',
    description: 'Direct funding to reforestation and carbon offset initiatives',
  },
  {
    icon: TrendingUp,
    title: 'Earn Rewards',
    description: 'Stake your tokens and earn while making a difference',
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black" />
      
      {/* Decorative glows */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-white">Transparent </span>
              <span className="gradient-text">Impact Finance</span>
            </h2>

            <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed">
              GreenFi is revolutionizing climate finance by connecting crypto staking with verified 
              environmental projects. Every stake funds real-world impact, tracked transparently on 
              the Hedera network.
            </p>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Our Guardian Proofs system ensures that every tree planted, every ton of CO₂ offset, 
              and every environmental milestone is verifiable and immutable. Your impact NFTs aren't 
              just badges—they're proof of real change.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex justify-center lg:justify-start">
              <Button size="lg" className="mt-4 w-full sm:w-auto">
                Explore the Guardian Proofs
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4 sm:space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ x: 10, scale: 1.02 }}
                className="flex items-start space-x-4 glass-effect-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-neon-green hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-neon-green/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-neon-green/50 transition-all">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
