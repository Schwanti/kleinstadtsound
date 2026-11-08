import Header from '@/components/sections/Header'
import Hero from '@/components/sections/Hero'
import Marquee from '@/components/sections/Marquee'
import DJs from '@/components/sections/DJs'
import Events from '@/components/sections/Events'
import About from '@/components/sections/About'
import EasterEggs from '@/components/ui/EasterEggs'
import { getCrew, getEvents } from '@/lib/content'

// Re-read crew and events (Sanity, when configured) every five minutes.
export const revalidate = 300

export default async function Home() {
  const [crew, events] = await Promise.all([getCrew(), getEvents()])

  return (
    <>
      <a className="skip" href="#djs">
        Zum Inhalt springen
      </a>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <DJs crew={crew} events={events} />
        <Events events={events} />
        <About events={events} />
      </main>

      <footer className="footer">
        <div className="wrap">
          <p className="footer__mast" aria-hidden="true">
            <span>Kleinstadtsound</span>
          </p>
          <div className="footer__row">
            <p className="label">
              © 2024 Kleinstadtsound. Aus Eichstätt,{' '}
              {/* Easter egg: hover or focus turns the coordinates into the T-shirt print. */}
              <span className="coords pixel" tabIndex={0}>
                <span>48°53′ N 11°11′ O</span>
                <span aria-hidden="true">I ♥ Altmühltal</span>
              </span>
            </p>
            <ul className="footer__links">
              <li>
                <a
                  className="link"
                  href="https://www.instagram.com/kle1nstadtsound/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a className="link" href="#">
                  SoundCloud
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <EasterEggs />
    </>
  )
}
