'use client'

import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => null,
})

export default function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
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
            DJ-Kollektiv aus Eichstätt. Elektronische Musik, von Italo Disco bis Breakbeat.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#events">
              Zu den Events
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
