'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  BedDouble,
  Car,
  Compass,
  Gift,
  Headphones,
  Plane,
  PlaneLanding,
  Tag,
  TrainFront,
} from 'lucide-react';

const SERVICES = [
  { label: 'Hotels', href: '/hotels', Icon: BedDouble, soft: false },
  { label: 'Flights', href: '/flights', Icon: Plane, soft: false },
  { label: 'Cabs', href: '/cabs', Icon: Car, soft: false },
  { label: 'Airport', href: '/cabs', Icon: PlaneLanding, soft: false },
  { label: 'Activities', href: '/activities', Icon: Compass, soft: true },
  { label: 'Trains', href: '/trains', Icon: TrainFront, soft: true },
  { label: 'Packages', href: '/packages', Icon: Gift, soft: true },
  { label: 'Offers', href: '/hotels?offers=true', Icon: Tag, soft: true },
] as const;

const DEALS = [
  {
    kicker: 'Goa hotel sale',
    title: 'Up to 35% off',
    detail: 'On selected Goa stays',
    href: '/hotels?city=Goa',
    image: '/images/home/lite/offer-goa.jpg',
  },
  {
    kicker: 'Holiday packages',
    title: '25% off',
    detail: 'Packages you can book now',
    href: '/packages',
    image: '/images/home/lite/offer-flights.jpg',
  },
  {
    kicker: 'Weekend stays',
    title: 'Up to 20% off',
    detail: 'Selected hotels this weekend',
    href: '/hotels?offers=true',
    image: '/images/home/lite/offer-weekend.jpg',
  },
] as const;

const INSPIRED = [
  { name: 'Himachal', href: '/packages?q=Himachal', image: '/images/home/lite/dest-manali.jpg' },
  { name: 'Kashmir', href: '/packages?q=Kashmir', image: '/images/home/lite/dest-kashmir.jpg' },
  { name: 'Rajasthan', href: '/packages?q=Jaipur', image: '/images/home/lite/dest-jaipur.jpg' },
  { name: 'Goa', href: '/packages?q=Goa', image: '/images/home/lite/dest-goa.jpg' },
] as const;

export function MobileTripHome() {
  const [deal, setDeal] = useState(0);
  const current = DEALS[deal];

  return (
    <section className="mtrip" aria-label="Mobile home">
      <Link className="mtrip-app" href="/app">
        <span className="mtrip-app-mark" aria-hidden>K</span>
        <span className="mtrip-app-copy">
          <strong>Download the KBC Trip</strong>
          <small>App and find exclusive deals</small>
        </span>
        <span className="mtrip-app-btn">Download</span>
      </Link>

      <nav className="mtrip-grid" aria-label="Travel services">
        {SERVICES.map((service) => (
          <Link
            key={service.label}
            href={service.href}
            className={service.soft ? 'mtrip-service is-soft' : 'mtrip-service'}
          >
            <span className="mtrip-bubble" aria-hidden>
              <service.Icon size={26} strokeWidth={1.75} />
            </span>
            <span>{service.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mtrip-deals">
        <h2>Limited-time deals</h2>
        <Link className="mtrip-deal" href={current.href}>
          <span className="mtrip-deal-copy">
            <small>{current.kicker}</small>
            <strong>{current.title}</strong>
            <em>{current.detail}</em>
            <b>Book now</b>
          </span>
          <img src={current.image} alt="" />
        </Link>
        <div className="mtrip-dots" role="tablist" aria-label="Deal slides">
          {DEALS.map((item, index) => (
            <button
              key={item.kicker}
              type="button"
              className={index === deal ? 'is-on' : undefined}
              aria-label={item.kicker}
              aria-selected={index === deal}
              onClick={() => setDeal(index)}
            />
          ))}
        </div>
      </div>

      <ul className="mtrip-trust">
        <li><Headphones size={15} aria-hidden /> 24/7 support</li>
        <li><BadgeCheck size={15} aria-hidden /> Verified stays</li>
      </ul>

      <div className="mtrip-inspired">
        <h2>Get inspired for your next trip</h2>
        <div className="mtrip-rail">
          {INSPIRED.map((place) => (
            <Link key={place.name} href={place.href} className="mtrip-card">
              <img src={place.image} alt="" />
              <strong>{place.name}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
