'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-4 bg-black/80 backdrop-blur-xl border-b border-white/5'
          : 'py-6 bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <a 
          href="#home" 
          className="text-xl font-bold text-white tracking-tight hover:text-accent transition-colors"
        >
          KS
        </a>
        
        <div className="flex items-center gap-8">
          <a 
            href="#djs" 
            className="text-sm text-white/60 hover:text-white transition-colors tracking-wider uppercase"
          >
            Künstler
          </a>
          <a 
            href="#events" 
            className="text-sm text-white/60 hover:text-white transition-colors tracking-wider uppercase"
          >
            Events
          </a>
          <a 
            href="#about" 
            className="text-sm text-white/60 hover:text-white transition-colors tracking-wider uppercase"
          >
            Über uns
          </a>
        </div>
      </nav>
    </header>
  )
}
