'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Matches production homepage offer rail. */
const offers = [
  {
    label: 'Goa Getaway — 35% off hotels',
    eyebrow: 'Goa Getaway',
    title: '35% off',
    detail: 'On hotels',
    href: '/hotels?city=Goa',
    image: '/reference/offer-backgrounds/goa-bg.png',
    className: 'offer-card-goa',
  },
  {
    label: 'Summer Special — 25% off flights',
    eyebrow: 'Summer Special',
    title: '25% off',
    detail: 'On packages',
    href: '/packages',
    image: '/reference/offer-backgrounds/flights-bg.png',
    className: 'offer-card-flights',
  },
  {
    label: 'Weekend Bus Deals from ₹499',
    eyebrow: 'Weekend bus deals',
    title: 'From ₹499',
    detail: 'On bus tickets',
    href: '/cabs',
    image: '/reference/offer-backgrounds/bus-bg.png',
    className: 'offer-card-buses',
  },
  {
    label: 'Weekend Bookings offers',
    eyebrow: 'Weekend stays',
    title: 'Up to 20% off',
    detail: 'On selected stays',
    href: '/hotels?offers=true',
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
          <p className="home-section-lead">Stays, packages, and weekend prices.</p>
        </div>
        <div className="offer-actions" aria-label="Offer actions">
          <Link href="/offers" className="home-section-link">
            View all
            <ChevronRight size={15} aria-hidden />
          </Link>
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
