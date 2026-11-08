import Image from 'next/image'
import type { CrewMember } from '@/content/crew'
import type { ArchiveEvent } from '@/content/events'
import { gigCount } from '@/lib/content'

type CrewProps = {
  crew: CrewMember[]
  events: ArchiveEvent[]
}

export default function DJs({ crew, events }: CrewProps) {
  return (
    <section id="djs" className="section" aria-labelledby="djs-title">
      <div className="wrap">
        <h2 id="djs-title" className="section-head">
          Crew
        </h2>

        <figure className="crew__photo">
          <Image
            src="/flyer/crew-open-air.jpg"
            alt="Die Crew am DJ-Pult beim Open Air am Berg"
            width={1000}
            height={466}
            sizes="(min-width: 80rem) 75rem, 100vw"
          />
        </figure>

        <ul className="index">
          {crew.map((dj) => {
            const gigs = gigCount(dj, events)
            return (
              <li key={dj.name} className="index__row">
                <h3 className="index__name">{dj.name}</h3>
                <div className="index__meta">
                  {gigs > 0 && (
                    <p className="index__count pixel">
                      {gigs}× im Line-up
                    </p>
                  )}
                  {dj.genres && dj.genres.length > 0 && (
                    <p className="index__genre">{dj.genres.join(', ')}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
