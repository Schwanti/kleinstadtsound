'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-white/50 text-sm tracking-widest uppercase">Laden</div>
    </div>
  ),
})

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 })

    tl.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }
    )
    .fromTo(
      subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 },
      '-=0.3'
    )
  }, [])

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      <Scene />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter"
        >
          KLEIN
        </h1>
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter -mt-4"
        >
          STADT
        </h1>
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-accent tracking-tighter -mt-4"
        >
          SOUND
        </h1>
        <p 
          ref={subtitleRef}
          className="mt-8 text-white/60 text-lg tracking-[0.3em] uppercase"
        >
          DJ Kollektiv · Eichstätt
        </p>
      </div>

      <div 
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Scrollen</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  )
}
