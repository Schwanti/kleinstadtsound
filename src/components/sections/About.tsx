export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <h2 id="about-title" className="section-head">
          Über uns
        </h2>

        <div className="about">
          <p className="about__statement">
            Ein DJ-Kollektiv aus Eichstätt, das elektronische Musik zum Leben erweckt.
          </p>
          <div className="about__body">
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
      </div>
    </section>
  )
}
