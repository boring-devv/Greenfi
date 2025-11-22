'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/90 backdrop-blur-xl shadow-lg shadow-neon-green/10' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl sm:text-2xl font-bold gradient-text cursor-pointer z-50"
            >
              GreenFi
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <NavLink href="#home">Home</NavLink>
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#impact">Impact</NavLink>
              <NavLink href="#about">About</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </div>

            {/* CTA Button - Desktop */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Button
                variant="outline"
                size="lg"
                className="hover:glow-green-strong"
                onClick={() => router.push('/app')}
              >
                Launch App
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden z-50 p-2 text-neon-green hover:bg-neon-green/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-center h-full space-y-8 px-6">
                <MobileNavLink href="#home" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </MobileNavLink>
                <MobileNavLink href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </MobileNavLink>
                <MobileNavLink href="#impact" onClick={() => setMobileMenuOpen(false)}>
                  Impact
                </MobileNavLink>
                <MobileNavLink href="#about" onClick={() => setMobileMenuOpen(false)}>
                  About
                </MobileNavLink>
                <MobileNavLink href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </MobileNavLink>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="pt-8"
                >
                  <Button
                    size="lg"
                    className="w-full min-w-[200px]"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      router.push('/app')
                    }}
                  >
                    Launch App
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.1, y: -2 }}
      className="text-gray-300 hover:text-neon-green transition-all duration-200 font-medium text-sm xl:text-base relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-green group-hover:w-full transition-all duration-300" />
    </motion.a>
  )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={{ scale: 1.1, x: 10 }}
      whileTap={{ scale: 0.95 }}
      className="text-2xl font-semibold text-gray-300 hover:text-neon-green transition-colors duration-200"
    >
      {children}
    </motion.a>
  )
}
