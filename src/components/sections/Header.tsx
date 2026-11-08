'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="nav" data-scrolled={isScrolled}>
      <nav className="wrap nav__inner" aria-label="Hauptnavigation">
        <a href="#home" className="nav__mark">
          Kleinstadtsound
        </a>

        <ul className="nav__links">
          <li>
            <a href="#djs">Künstler</a>
          </li>
          <li>
            <a href="#events">Events</a>
          </li>
          <li>
            <a href="#about">Über uns</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
