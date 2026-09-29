'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Live products only — hotels, packages, cabs. No fake flights/buses. */
const offers = [
  {
    label: 'Goa Getaway — hotel deals',
    eyebrow: 'Stays',
    title: 'Goa weekends',
    detail: 'Beach stays from ₹3,999',
    href: '/hotels?city=Goa',
    image: '/reference/offer-backgrounds/goa-bg.png',
    className: 'offer-card-goa',
  },
  {
    label: 'Himachal holiday packages',
    eyebrow: 'Packages',
    title: 'Hill circuits',
    detail: 'Manali & Shimla tours',
    href: '/packages?q=Manali',
    image: '/reference/destination-backgrounds/manali-bg.png',
    className: 'offer-card-packages',
  },
  {
    label: 'Airport & outstation cabs',
    eyebrow: 'Cabs',
    title: 'Free quotes',
    detail: 'Compare partner fares',
    href: '/cabs',
    image: '/images/cabs/uno-cabs-traveller-pickup-v2.png',
    className: 'offer-card-cabs',
  },
  {
    label: 'Weekend stay offers',
    eyebrow: 'Stays',
    title: 'Up to 20% off',
    detail: 'On selected hotels',
    href: '/hotels',
    image: '/reference/offer-backgrounds/weekend-bg.png',
    className: 'offer-card-weekend',
  },
] as const;

export function OfferShowcase() {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollOffers = (direction: 'left' | 'right') => {
    railRef.current?.scrollBy({
      left: direction === 'left' ? -380 : 380,
      behavior: 'smooth',
    });
  };

  return (
    <section className="page-width reference-section offers-section" id="offers" aria-labelledby="offers-title">
      <div className="section-heading">
        <div className="section-heading-copy">
          <p className="section-kicker">Offers</p>
          <h2 id="offers-title">Worth booking now</h2>
        </div>
        <div className="offer-actions" aria-label="Offer actions">
          <Link href="/hotels">View all offers</Link>
          <button type="button" onClick={() => scrollOffers('left')} aria-label="Show previous offers">
            <ChevronLeft size={14} />
          </button>
          <button type="button" onClick={() => scrollOffers('right')} aria-label="Show more offers">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="offer-card-rail" aria-label="Current travel offers" ref={railRef}>
        {offers.map((offer) => (
          <Link
            className={`offer-card ${offer.className}`}
            href={offer.href}
            key={offer.label}
            aria-label={offer.label}
          >
            <Image
              className="offer-card-image"
              src={offer.image}
              alt=""
              fill
              sizes="(max-width: 700px) 82vw, 32vw"
              unoptimized
            />
            <span className="offer-card-shade" aria-hidden="true" />
            <span className="offer-card-copy">
              <span className="offer-card-eyebrow">{offer.eyebrow}</span>
              <strong>{offer.title}</strong>
              <span className="offer-card-detail">{offer.detail}</span>
              <span className="offer-card-cta">Book now</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
