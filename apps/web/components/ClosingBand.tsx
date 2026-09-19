import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  { n: '01', title: 'Choose a stay', copy: 'Search verified homes and hotels with live rates.' },
  { n: '02', title: 'Hold the room', copy: 'Ten minutes to review the folio — no charge yet.' },
  { n: '03', title: 'Pay and go', copy: 'Confirm once. The ticket lands in My trips.' },
] as const;

export function ClosingBand() {
  return (
    <>
      <section className="page-width closing-path" aria-labelledby="closing-path-title">
        <div className="closing-path-head">
          <p>How booking works</p>
          <h2 id="closing-path-title">Search. Hold. Arrive.</h2>
        </div>
        <ol className="closing-steps">
          {steps.map((step) => (
            <li key={step.n}>
              <div className="closing-step-top">
                <span>{step.n}</span>
                <b>{step.title}</b>
              </div>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="closing-story" aria-labelledby="closing-story-title">
        <Image
          className="closing-story-photo"
          src="/reference/destination-backgrounds/goa-bg.png"
          alt=""
          fill
          sizes="100vw"
          unoptimized
        />
        <div className="closing-story-scrim" aria-hidden="true" />
        <div className="page-width closing-story-inner">
          <p>From a recent stay</p>
          <blockquote id="closing-story-title">
            Hotels, cabs and the itinerary sat in one place. We stopped juggling tabs and just went.
          </blockquote>
          <cite>Riya Sharma · Mumbai · Goa weekend</cite>
          <div className="closing-story-actions">
            <Link href="/hotels">
              Browse stays <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="closing-story-quiet">
              Sign in to save trips
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
