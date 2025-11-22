'use client'

import { motion } from 'framer-motion'
import { Twitter, Linkedin, MessageCircle, Github } from 'lucide-react'

const links = {
  company: [
    { name: 'About', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Impact', href: '#impact' },
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'FAQ', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ],
}

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Github, href: '#', label: 'GitHub' },
]

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-neon-green/20 bg-black">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green to-transparent" />
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-green/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2 text-center sm:text-left">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl sm:text-3xl font-bold gradient-text mb-4 inline-block"
            >
              GreenFi
            </motion.div>
            <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-sm mx-auto sm:mx-0">
              Stake-to-Plant Protocol. Making environmental impact accessible, transparent, 
              and rewarding through blockchain technology.
            </p>
            <div className="flex space-x-4 justify-center sm:justify-start">
              {socials.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 glass-effect rounded-xl flex items-center justify-center hover:border-neon-green hover:bg-neon-green/10 hover:shadow-lg hover:shadow-neon-green/30 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-neon-green transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {links.company.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-sm sm:text-base text-gray-400 hover:text-neon-green transition-colors"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {links.resources.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-sm sm:text-base text-gray-400 hover:text-neon-green transition-colors"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-sm sm:text-base text-gray-400 hover:text-neon-green transition-colors"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} GreenFi. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs sm:text-sm text-center md:text-right">
            Built on <span className="text-neon-green">Hedera</span> with ❤️ for the planet
          </p>
        </div>
      </div>
    </footer>
  )
}
