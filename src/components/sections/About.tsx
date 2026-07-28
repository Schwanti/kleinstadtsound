'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const text = textRef.current
    const link = linkRef.current

    if (!section || !title || !text || !link) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    })

    tl.fromTo(title, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
      .fromTo(text.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, '-=0.5')
      .fromTo(link, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} id="about" className="min-h-screen py-32 px-4 flex items-center">
      <div className="max-w-4xl mx-auto">
        <h2 
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-white mb-16 tracking-tight"
        >
          Über uns
        </h2>

        <div ref={textRef} className="space-y-8">
          <p className="text-2xl md:text-3xl text-white/80 leading-relaxed font-light">
            Ein DJ-Kollektiv aus Eichstätt, das elektronische Musik zum Leben erweckt.
          </p>
          <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
            Wir organisieren Partys, arbeiten mit Bars und anderen Kollektiven zusammen, 
            um die Kultur in Eichstätt und darüber hinaus wiederzubeleben. Jeder DJ bringt 
            seinen eigenen Sound — von Italo Disco bis Breakbeat.
          </p>
        </div>

        <a 
          ref={linkRef}
          href="https://www.instagram.com/kle1nstadtsound/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mt-12 px-8 py-4 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-500 group"
        >
          <span className="tracking-wider uppercase text-sm">Folge uns</span>
          <svg 
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  )
}
