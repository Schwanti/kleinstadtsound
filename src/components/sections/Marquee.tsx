'use client'

import { useState } from 'react'

const LINE = 'Mit Musik können Menschen nicht unsympathisch sein'

export default function Marquee() {
  const [paused, setPaused] = useState(false)

  return (
    <section className="marquee" data-paused={paused} aria-label="Leitsatz">
      <div className="marquee__viewport">
        <div className="marquee__track">
          <p className="marquee__item">{LINE}</p>
          <p className="marquee__item" aria-hidden="true">
            {LINE}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="marquee__toggle"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? 'Abspielen' : 'Anhalten'}
      </button>
    </section>
  )
}
