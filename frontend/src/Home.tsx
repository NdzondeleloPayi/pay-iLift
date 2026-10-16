import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <a className="brand" href="#home" aria-label="Pay-iLift home">
          <span className="brand-icon">P</span>
          <span>Pay-iLift</span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#benefits">Benefits</a>
          <a href="#safety">Safety</a>
        </nav>

        <div className="nav-actions">
          <Link className="login-button" to="/login">
            Log in
          </Link>
          <Link className="button button-small" to="/register">
            Get started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              YOUR JOURNEY, SHARED
            </span>

            <h1>
              A better commute
              <br />
              starts <span>together.</span>
            </h1>

            <p className="hero-description">
              Connect with people travelling your way.
              Share lifts, reduce commuting costs, and
              make getting to work a little easier.
            </p>

            <div className="hero-actions">
              <Link className="button" to="/lifts">
                Find a lift <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button-outline" to="/offer-lift">
                Offer a lift
              </Link>
            </div>

            <div className="hero-note">
              <span className="note-icon" aria-hidden="true">✓</span>
              Built around your daily commute
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-topline">
                <span className="status-dot" />
                YOUR DAILY JOURNEY
              </div>

              <div className="route-point">
                <span className="route-marker marker-start" />
                <div>
                  <span className="route-label">PICK-UP AREA</span>
                  <strong>Near your home</strong>
                </div>
              </div>

              <div className="route-line">
                <span>Shared commute</span>
              </div>

              <div className="route-point">
                <span className="route-marker marker-end" />
                <div>
                  <span className="route-label">DESTINATION</span>
                  <strong>Your workplace</strong>
                </div>
              </div>

              <div className="visual-divider" />

              <div className="visual-bottom">
                <div className="people-icon" aria-hidden="true">♧</div>
                <div>
                  <strong>Better together</strong>
                  <span>Share the journey, not just the road.</span>
                </div>
              </div>
            </div>

            <div className="floating-tag">
              <span aria-hidden="true">↗</span>
              One journey. Shared costs.
            </div>
          </div>
        </section>

        {/* Benefits strip */}
        <section className="benefits-strip" id="benefits">
          <div>
            <span className="benefit-icon">R</span>
            <div>
              <strong>Share commuting costs</strong>
              <p>Make your daily travel more affordable.</p>
            </div>
          </div>

          <div>
            <span className="benefit-icon">↗</span>
            <div>
              <strong>Travel your route</strong>
              <p>Connect around compatible journeys.</p>
            </div>
          </div>

          <div>
            <span className="benefit-icon">♡</span>
            <div>
              <strong>Build trust</strong>
              <p>Keep your commute and communication organised.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">SIMPLE BY DESIGN</span>
            <h2>Your commute, made simpler.</h2>
            <p>
              Pay-iLift aims to make it easier for colleagues
              travelling in the same direction to connect.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Create your profile</h3>
              <p>
                Add your workplace, preferred route,
                and commuting details.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Coordinate your journey</h3>
              <p>
                Share your commute details and connect
                with compatible travel arrangements.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Make the trip</h3>
              <p>
                Keep trip information and feedback
                organised in one place.
              </p>
            </article>
          </div>
        </section>

        {/* Safety */}
        <section className="safety-section" id="safety">
          <div>
            <span className="eyebrow">TRUST MATTERS</span>
            <h2>A commute you can feel good about.</h2>
            <p>
              Our goal is to build a platform where commuters
              can manage their profiles, trips, and feedback
              with privacy and accountability in mind.
            </p>
          </div>

          <div className="safety-points">
            <p><span>✓</span> Account-based access</p>
            <p><span>✓</span> Personal profile privacy</p>
            <p><span>✓</span> Trip feedback and review workflows</p>
          </div>
        </section>

        {/* Call to action */}
        <section className="cta-section">
          <span className="eyebrow">LET'S MOVE FORWARD</span>
          <h2>Your journey doesn't have to be a solo one.</h2>
          <p>Join us in rethinking the daily commute.</p>
          <Link className="button cta-button" to="/register">
            Get started <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">P</span>
          <span>Pay-iLift</span>
        </a>
        <p>Share the ride. Lighten the journey.</p>
        <span>© {new Date().getFullYear()} Pay-iLift</span>
      </footer>
    </div>
  )
}

export default App
