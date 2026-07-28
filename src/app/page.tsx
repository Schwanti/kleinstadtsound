import Header from '@/components/sections/Header'
import Hero from '@/components/sections/Hero'
import DJs from '@/components/sections/DJs'
import Events from '@/components/sections/Events'
import About from '@/components/sections/About'

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen selection:bg-accent selection:text-white">
      <Header />
      <main>
        <Hero />
        <DJs />
        <Events />
        <About />
      </main>
      
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-white/30 text-sm">© 2024 Kleinstadtsound</p>
          <div className="flex items-center gap-6">
            <a 
              href="https://www.instagram.com/kle1nstadtsound/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white text-sm transition-colors"
            >
              Instagram
            </a>
            <a 
              href="#"
              className="text-white/30 hover:text-white text-sm transition-colors"
            >
              SoundCloud
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
