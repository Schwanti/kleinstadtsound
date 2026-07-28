'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const events = [
  {
    id: 1,
    title: 'Sommer Nacht',
    date: '2024-07-15',
    location: 'Eichstätt',
    type: 'organized' as const,
  },
  {
    id: 2,
    title: 'Club Nacht',
    date: '2024-06-20',
    location: 'München',
    type: 'guest' as const,
  },
  {
    id: 3,
    title: 'Dach Sessions',
    date: '2024-05-10',
    location: 'Eichstätt',
    type: 'organized' as const,
  },
]

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const items = listRef.current?.children

    if (!section || !title || !items) return

    gsap.fromTo(
      title,
      { x: -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )

    Array.from(items).forEach((item, i) => {
      gsap.fromTo(
        item,
        { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item as Element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} id="events" className="min-h-screen py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-white mb-20 tracking-tight"
        >
          Events
        </h2>

        <div ref={listRef} className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="group flex items-center gap-6 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.02]"
            >
              <div className="flex-shrink-0 w-24 text-right">
                <span className="text-white/40 text-sm">
                  {new Date(event.date).toLocaleDateString('de-DE', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="w-px h-12 bg-white/10 group-hover:bg-accent transition-colors duration-500" />

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white group-hover:text-accent transition-colors duration-300">
                  {event.title}
                </h3>
                <p className="text-white/40 text-sm mt-1">{event.location}</p>
              </div>

              <div className="flex-shrink-0">
                <span
                  className={`px-4 py-2 rounded-full text-xs tracking-wider uppercase ${
                    event.type === 'organized'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-white/5 text-white/60'
                  }`}
                >
                  {event.type === 'organized' ? 'Organisiert' : 'Gast'}
                </span>
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
