import Image from 'next/image'
import type { ArchiveEvent } from '@/content/events'

type AboutProps = {
  events: ArchiveEvent[]
}

// Places and partners are read from the archive, so they stay in step with it.
function tally(values: string[]) {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export default function About({ events }: AboutProps) {
  const places = tally(
    events.filter((e) => e.venue).map((e) => [e.venue, e.city].filter(Boolean).join(', ')),
  )
  const partners = tally(events.flatMap((e) => e.partners ?? []))

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      {/* Easter egg: taped over the passage, as it hangs in real life. Words from the song. */}
      <p className="tape-banner" aria-label="A Mensch möcht i bleim">
        {['A', 'Mensch', 'möcht', 'i', 'bleim'].map((word) => (
          <span key={word} aria-hidden="true">
            {word}
          </span>
        ))}
      </p>
      <div className="wrap">
        <h2 id="about-title" className="section-head">
          Über uns
        </h2>

        <div className="about">
          <figure className="about__photo">
            <Image
              src="/flyer/crew-nest.jpg"
              alt="Kleinstadtsound am DJ-Pult im Nest, Ingolstadt"
              width={1000}
              height={995}
              sizes="(min-width: 64rem) 55vw, 100vw"
            />
          </figure>
          <div className="about__body">
            <p className="about__statement">
              Ein DJ-Kollektiv aus Eichstätt, das elektronische Musik zum Leben erweckt.
            </p>
            <p>
              Wir organisieren Partys, arbeiten mit Bars und anderen Kollektiven zusammen,
              um die Kultur in Eichstätt und darüber hinaus wiederzubeleben. Jeder DJ bringt
              seinen eigenen Sound, von Italo Disco bis Breakbeat.
            </p>
            <p>
              <a
                className="btn btn--secondary"
                href="https://www.instagram.com/kle1nstadtsound/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Folge uns
              </a>
            </p>
          </div>
        </div>

        <div className="facts">
          <div>
            <h3>Wo wir spielen</h3>
            <ul>
              {places.map(([place, n]) => (
                <li key={place}>
                  {place}
                  <span className="pixel">{n}×</span>
                </li>
              ))}
            </ul>
          </div>
          {partners.length > 0 && (
            <div>
              <h3>Mit wem</h3>
              <ul>
                {partners.map(([name, n]) => (
                  <li key={name}>
                    {name}
                    <span className="pixel">{n}×</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
