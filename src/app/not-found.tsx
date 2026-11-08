import Link from 'next/link'

// Easter egg: a lost page ends up where everyone ends up.
export default function NotFound() {
  return (
    <main className="lost">
      <div className="wrap lost__inner">
        <p className="lost__code pixel">404</p>
        <h1 className="lost__head">Diese Seite ist in der Kellerbar versackt.</h1>
        <p className="lost__text">Sie taucht bestimmt wieder auf, spätestens wenn das Licht angeht.</p>
        <Link className="btn btn--primary" href="/">
          Zurück auf die Tanzfläche
        </Link>
      </div>
    </main>
  )
}
