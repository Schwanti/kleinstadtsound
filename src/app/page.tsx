import Header from '@/components/sections/Header'
import Hero from '@/components/sections/Hero'
import Marquee from '@/components/sections/Marquee'
import DJs from '@/components/sections/DJs'
import Events from '@/components/sections/Events'
import About from '@/components/sections/About'

export default function Home() {
  return (
    <>
      <a className="skip" href="#djs">
        Zum Inhalt springen
      </a>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <DJs />
        <Events />
        <About />
      </main>

      <footer className="footer">
        <div className="wrap">
          <p className="footer__mast" aria-hidden="true">
            <span>Kleinstadtsound</span>
          </p>
          <div className="footer__row">
            <p className="label">© 2024 Kleinstadtsound</p>
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
    </>
  )
}
