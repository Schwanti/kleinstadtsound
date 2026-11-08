const djs = [
  { id: 1, name: 'DJ Eins', genre: 'Italo Disco', image: '/placeholder-dj.jpg' },
  { id: 2, name: 'DJ Zwei', genre: 'Breakbeat', image: '/placeholder-dj.jpg' },
  { id: 3, name: 'DJ Drei', genre: 'House', image: '/placeholder-dj.jpg' },
]

export default function DJs() {
  return (
    <section id="djs" className="section" aria-labelledby="djs-title">
      <div className="wrap">
        <h2 id="djs-title" className="section-head">
          Künstler
        </h2>

        <ul className="index">
          {djs.map((dj) => (
            <li key={dj.id} className="index__row">
              <h3 className="index__name">{dj.name}</h3>
              <p className="index__genre">{dj.genre}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
