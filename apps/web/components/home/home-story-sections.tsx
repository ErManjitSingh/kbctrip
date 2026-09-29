import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  MapPinned,
  Sparkles,
} from 'lucide-react';

export function HomeCabsSection() {
  return (
    <section className="home-band home-band-cabs" aria-labelledby="home-cabs-title">
      <div className="page-width">
        <div className="home-cabs-panel kbc-media-cover">
          <Image
            src="/images/cabs/uno-cabs-traveller-pickup-v2.png"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 1120px"
            className="home-cabs-panel-img"
            priority={false}
            unoptimized
          />
          <span className="home-cabs-panel-shade" aria-hidden />

          <div className="home-cabs-copy">
            <p className="section-kicker">Cabs</p>
            <h2 id="home-cabs-title">Airport &amp; outstation, without the chase</h2>
            <p className="home-section-lead">
              Post once. Partners quote. You compare and book when the fare feels right —
              sedan to tempo, city to hills.
            </p>

            <ul className="home-cabs-stats">
              <li>
                <strong>Free quotes</strong>
                <span>No chase, no pressure</span>
              </li>
              <li>
                <strong>Verified partners</strong>
                <span>Local fleet, clear fares</span>
              </li>
              <li>
                <strong>Any route</strong>
                <span>Airport · outstation · hills</span>
              </li>
            </ul>

            <div className="home-cabs-actions">
              <Link href="/cabs" className="home-cabs-btn-primary">
                Get free quotes
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
      icon: MapPinned,
      title: 'Pick your lane',
      body: 'Hotels, packages, or cabs — start with what you need.',
    },
    {
      icon: CalendarDays,
      title: 'Compare & choose',
      body: 'Clear options and pricing before you commit.',
    },
    {
      icon: Sparkles,
      title: 'Book in one account',
      body: 'Confirm once. Manage everything under My trips.',
    },
  ] as const;

  return (
    <section className="home-band home-band-steps" aria-labelledby="home-steps-title">
      <div className="page-width">
        <div className="home-section-head home-section-head-center">
          <div>
            <p className="section-kicker">How it works</p>
            <h2 id="home-steps-title">Three steps. One trip.</h2>
          </div>
        </div>

        <ol className="home-steps-rail">
          {steps.map((step, index) => (
            <li key={step.title} className="home-step">
              <span className="home-step-num">{String(index + 1).padStart(2, '0')}</span>
              <span className="home-step-icon-wrap" aria-hidden>
                <step.icon size={18} />
              </span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
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
              Stays, packages, and cab quotes — India first, one KBC Trip account.
            </p>
          </div>
          <div className="home-cta-actions">
            <Link href="/hotels" className="home-primary-btn">
              Find a stay
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/packages" className="home-ghost-btn">
              Explore packages
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
