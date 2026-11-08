import Image from 'next/image'
import type { ArchiveEvent } from '@/content/events'

type EventsProps = {
  events: ArchiveEvent[]
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

function EventCard({ event }: { event: ArchiveEvent }) {
  const place = [event.venue, event.city].filter(Boolean).join(', ')
  return (
    <li className="card" data-accent={event.accent}>
      <div className="card__flyer">
        {event.flyer && (
          <Image
            src={event.flyer}
            alt={`Flyer: ${event.title}, ${formatDate(event.date)}`}
            fill
            sizes="(min-width: 80rem) 25vw, (min-width: 40rem) 45vw, 100vw"
          />
        )}
      </div>
      <time className="card__date pixel" dateTime={event.date}>
        {formatDate(event.date)}
      </time>
      <h4 className="card__title">{event.title}</h4>
      {place && <p className="card__place">{place}</p>}
      {event.lineup.length > 0 && <p className="card__lineup">{event.lineup.join(', ')}</p>}
      {(event.info || event.partners || event.type === 'guest') && (
        <p className="card__info">
          {[
            event.type === 'guest' ? 'Gastauftritt' : null,
            event.partners ? `mit ${event.partners.join(' und ')}` : null,
            event.info,
          ]
            .filter(Boolean)
            .join('. ')}
        </p>
      )}
    </li>
  )
}

function byYear(list: ArchiveEvent[]) {
  const years = new Map<string, ArchiveEvent[]>()
  for (const e of list) {
    const y = e.date.slice(0, 4)
    years.set(y, [...(years.get(y) ?? []), e])
  }
  return [...years.entries()]
}

export default function Events({ events }: EventsProps) {
  const groups = byYear(events)
  const [latest, ...older] = groups
  const olderCount = older.reduce((n, [, list]) => n + list.length, 0)

  const renderYear = ([year, list]: [string, ArchiveEvent[]]) => (
    <div key={year}>
      <h3 className="archive__year">
        {year}
        <span>{list.length} Events</span>
      </h3>
      <ul className="archive__grid">
        {list.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ul>
    </div>
  )

  return (
    <section id="events" className="section" aria-labelledby="events-title">
      <div className="wrap">
        <h2 id="events-title" className="section-head">
          Events
        </h2>

        {latest && renderYear(latest)}

        {older.length > 0 && (
          <details className="archive__more">
            <summary>
              Ältere Events anzeigen ({olderCount})
            </summary>
            {older.map(renderYear)}
          </details>
        )}
      </div>
    </section>
  )
}
