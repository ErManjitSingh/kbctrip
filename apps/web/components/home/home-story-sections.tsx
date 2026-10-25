import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HomeCabsSection() {
  return (
    <section className="home-band home-band-cabs" aria-labelledby="home-cabs-title">
      <div className="home-cabs-stage">
        <div className="home-cabs-media" aria-hidden="true">
          <Image
            src="/images/cabs/uno-cabs-traveller-pickup-v2.png"
            alt=""
            fill
            sizes="100vw"
            className="home-cabs-media-img"
            priority={false}
            unoptimized
          />
          <span className="home-cabs-media-veil" />
          <span className="home-cabs-media-grain" />
        </div>

        <div className="page-width home-cabs-frame">
          <div className="home-cabs-copy">
            <p className="home-cabs-kicker">
              <span className="home-cabs-kicker-dot" aria-hidden />
              Private cabs
            </p>
            <h2 id="home-cabs-title">
              The car is waiting.
              <span> You just arrive.</span>
            </h2>
            <p className="home-cabs-lead">
              Airport runs and hill routes. Post once, compare quotes, then book.
            </p>

            <div className="home-cabs-route" aria-hidden="true">
              <span>Airport</span>
              <span className="home-cabs-route-line" />
              <span>City</span>
              <span className="home-cabs-route-line" />
              <span>Hills</span>
            </div>

            <div className="home-cabs-actions">
              <Link href="/cabs" className="home-cabs-btn-primary">
                Get cab quotes
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/cabs/list-your-cab" className="home-cabs-btn-ghost">
                List your cab
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeHowItWorksSection() {
  const steps = [
    {
      title: 'Pick your lane',
      body: 'Hotels, packages, or cabs — begin with the piece that unlocks the rest of the trip.',
    },
    {
      title: 'Compare without the fog',
      body: 'Options and pricing stay visible. No chase, no opaque add-ons before you decide.',
    },
    {
      title: 'Confirm once',
      body: 'Book into one KBC Trip account. Hotels, packages, and cabs live together under My trips.',
    },
  ] as const;

  return (
    <section className="home-band home-band-steps" aria-labelledby="home-steps-title">
      <div className="page-width home-steps-spread">
        <figure className="home-steps-visual">
          <Image
            src="/images/brochure-himalayan-dawn.png"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
            className="home-steps-visual-img"
            unoptimized
          />
          <figcaption className="home-steps-visual-cap">
            <span>India first</span>
            <strong>Then the map opens</strong>
          </figcaption>
        </figure>

        <div className="home-steps-copy">
          <p className="home-steps-kicker">How it works</p>
          <h2 id="home-steps-title">
            A short path
            <em> to a real trip.</em>
          </h2>
          <p className="home-steps-lead">
            No maze. Three quiet moves from curiosity to confirmation.
          </p>

          <ol className="home-steps-list">
            {steps.map((step, index) => (
              <li key={step.title} className="home-step" style={{ ['--step-i' as string]: index }}>
                <span className="home-step-index" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="home-step-body">
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function HomeFinalCtaSection() {
  return (
    <section className="home-band home-band-cta" aria-labelledby="home-cta-title">
      <div className="page-width">
        <div className="home-cta-panel">
          <div className="home-cta-copy">
            <p className="section-kicker">Ready when you are</p>
            <h2 id="home-cta-title">Plan the next escape today</h2>
            <p className="home-section-lead">
              Stays, packages, and cab quotes. One KBC Trip account.
            </p>
          </div>
          <div className="home-cta-actions">
            <Link href="/hotels" className="home-primary-btn">
              Browse stays
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/packages" className="home-ghost-btn">
              View packages
            </Link>
            <Link href="/cabs" className="home-ghost-btn">
              Get cab quotes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
