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
  return (
    <section id="events" className="section" aria-labelledby="events-title">
      <div className="wrap">
        <h2 id="events-title" className="section-head">
          Events
        </h2>

        <ol className="record">
          {events.map((event) => (
            <li key={event.id} className="record__row">
              <time className="record__date" dateTime={event.date}>
                {new Date(event.date).toLocaleDateString('de-DE', {
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
              <div>
                <h3 className="record__title">{event.title}</h3>
                <p className="record__meta">{event.location}</p>
              </div>
              <p className="record__type">
                {event.type === 'organized' ? 'Organisiert' : 'Gast'}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
