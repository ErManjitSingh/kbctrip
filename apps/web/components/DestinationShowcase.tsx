'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CloudSun } from 'lucide-react';

const destinations = [
  {
    name: 'Goa',
    region: 'India',
    weather: '28°C',
    price: '₹3,999',
    trending: true,
    href: '/hotels?city=Goa',
    image: '/reference/destination-backgrounds/goa-bg.png',
    className: 'destination-card-goa',
  },
  {
    name: 'Manali',
    region: 'Himachal Pradesh',
    weather: '18°C',
    price: '₹2,999',
    trending: false,
    href: '/hotels?city=Manali',
    image: '/reference/destination-backgrounds/manali-bg.png',
    className: 'destination-card-manali',
  },
  {
    name: 'Kashmir',
    region: 'India',
    weather: '16°C',
    price: '₹4,999',
    trending: false,
    href: '/hotels?city=Kashmir',
    image: '/reference/destination-backgrounds/kashmir-bg.png',
    className: 'destination-card-kashmir',
  },
  {
    name: 'Dubai',
    region: 'UAE',
    weather: '34°C',
    price: '₹7,999',
    trending: false,
    href: '/hotels?city=Dubai',
    image: '/reference/destination-backgrounds/dubai-bg.png',
    className: 'destination-card-dubai',
  },
  {
    name: 'Jaipur',
    region: 'Rajasthan',
    weather: '32°C',
    price: '₹2,499',
    trending: false,
    href: '/hotels?city=Jaipur',
    image: '/reference/destination-backgrounds/jaipur-bg.png',
    className: 'destination-card-jaipur',
  },
  {
    name: 'Shimla',
    region: 'Himachal Pradesh',
    weather: '14°C',
    price: '₹2,799',
    trending: false,
    href: '/hotels?city=Shimla',
    image: '/images/brochure-shimla-church.png',
    className: 'destination-card-shimla',
  },
] as const;

export function DestinationShowcase() {
  return (
    <section
      className="page-width reference-section destination-section"
      id="popular-destinations"
      aria-labelledby="popular-destinations-title"
    >
      <div className="section-heading">
        <div className="section-heading-copy">
          <p className="section-kicker">Destinations</p>
          <h2 id="popular-destinations-title">Where to next</h2>
        </div>
        <Link href="/hotels" className="destination-view-all">
          View all stays
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="destination-card-grid">
        {destinations.map((destination) => (
          <Link
            className={`destination-card ${destination.className}`}
            href={destination.href}
            key={destination.name}
            aria-label={`Explore stays in ${destination.name}`}
          >
            <Image
              className="destination-card-image"
              src={destination.image}
              alt=""
              fill
              sizes="(max-width: 520px) 50vw, (max-width: 900px) 45vw, 32vw"
              unoptimized
            />
            <span className="destination-card-shade" aria-hidden="true" />
            <span className="destination-card-top">
              <span className="destination-card-title">{destination.name}</span>
              <span className="destination-card-region">{destination.region}</span>
            </span>
            {destination.trending && <span className="destination-card-trending">Trending</span>}
            <span className="destination-card-bottom">
              <span className="destination-card-weather">
                <CloudSun size={18} strokeWidth={2.4} /> {destination.weather}
              </span>
              <span className="destination-card-price">From {destination.price}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
