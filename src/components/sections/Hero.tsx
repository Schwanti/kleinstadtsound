'use client'

import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => null,
})

const SLOGAN = 'Mit Musik können Menschen nicht unsympathisch sein'

export default function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      {/* More lines than any screen needs; the wall clips the rest. */}
      <div className="hero__wall" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i}>{SLOGAN} {SLOGAN}</p>
        ))}
      </div>
      <div className="hero__canvas" aria-hidden="true">
        <Scene />
      </div>

      <div className="wrap hero__inner">
        <h1 id="hero-title" className="hero__head">
          <span>Klein</span>
          <span>Stadt</span>
          <span className="hot">Sound</span>
        </h1>

        <div className="hero__foot">
          <p className="hero__lede">
            DJ-Kollektiv aus Eichstätt. House, Breakbeat, Elektro und UK Garage, meistens in der Kellerbar.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#events">
              Zum Event-Archiv
            </a>
            <a
              className="btn btn--secondary"
              href="https://www.instagram.com/kle1nstadtsound/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
