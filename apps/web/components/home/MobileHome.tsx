'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CreditCard, Headphones, Heart, Tag, Users } from 'lucide-react';
import { TravelSearch } from '@/components/TravelSearch';
import { HomeBoardSlider } from '@/components/home/HomeBoardSlider';
import './mobile-home.css';

const destinations = [
  { name: 'Manali', href: '/hotels?city=Manali', image: '/images/home/lite/dest-manali.jpg' },
  { name: 'Shimla', href: '/hotels?city=Shimla', image: '/images/home/lite/dest-shimla.jpg' },
  { name: 'Kasol', href: '/hotels?city=Kasol', image: '/meta/himachal_special/kullu.webp' },
  { name: 'Auli', href: '/hotels?city=Auli', image: '/images/home/lite/card-ridge.jpg' },
];

const stays = [
  { name: 'Riverside lodge', href: '/hotels?city=Manali', image: '/images/home/lite/card-lodge.jpg' },
  { name: 'Ridge cottage', href: '/hotels?city=Shimla', image: '/images/home/lite/dest-shimla.jpg' },
  { name: 'Pine cabin', href: '/hotels?city=Manali', image: '/images/home/lite/hero-mobile.jpg' },
  { name: 'Valley stay', href: '/hotels?city=Kasol', image: '/images/home/lite/dest-manali.jpg' },
];

const trust = [
  { icon: BadgeCheck, label: 'Verified stays' },
  { icon: Headphones, label: '24/7 support' },
  { icon: CreditCard, label: 'Secure payments' },
  { icon: Tag, label: 'Best deals' },
  { icon: Users, label: '1.2M+ travellers' },
];

export function MobileHome() {
  return (
    <div className="m-home">
      <link rel="preload" as="image" href="/images/home/lite/hero-mobile.jpg" media="(max-width: 760px)" />
      <section className="m-hero">
        <Image
          className="m-hero-photo"
          src="/images/home/lite/hero-mobile.jpg"
          alt=""
          fill
          sizes="100vw"
        />
        <div className="m-hero-copy">
          <Image
            className="m-trusted"
            src="/reference/trusted-hero.png"
            alt="Trusted by 1.2 million happy travellers"
            width={210}
            height={46}
          />
          <h1>
            Book
            <br />
            <em>everything.</em>
            <br />
            Travel
            <br />
            <em>everywhere.</em>
          </h1>
          <p>Private stays, considered itineraries, one account. India first, then the rest of the map.</p>
        </div>
      </section>

      <div className="m-search-slot">
        <TravelSearch />
      </div>

      <HomeBoardSlider className="home-board-mobile" />

      <ul className="m-trust">
        {trust.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <span>
                <Icon size={16} strokeWidth={1.8} aria-hidden />
              </span>
              {item.label}
            </li>
          );
        })}
      </ul>

      <section className="m-block" aria-labelledby="m-dest-title">
        <div className="m-block-head">
          <div>
            <p>Explore top destinations</p>
            <h2 id="m-dest-title">
              Handpicked for your
              <br />
              <em>next trip</em>
            </h2>
          </div>
          <Link href="/hotels">
            View all <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
        <div className="m-rail">
          {destinations.map((place) => (
            <Link key={place.name} href={place.href} className="m-dest">
              <Image src={place.image} alt="" fill sizes="148px" />
              <span>
                {place.name} <ArrowRight size={13} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="m-block" aria-labelledby="m-pack-title">
        <Link href="/packages" className="m-pack">
          <div>
            <p>Curated Packages</p>
            <h2 id="m-pack-title">
              Plan more,
              <br />
              worry less.
            </h2>
            <small>Hassle-free itineraries for unforgettable journeys.</small>
            <span>
              View packages <ArrowRight size={14} aria-hidden />
            </span>
          </div>
          <div className="m-pack-photo">
            <Image src="/images/home/lite/card-ridge.jpg" alt="" fill sizes="180px" />
          </div>
        </Link>
      </section>

      <section className="m-block m-block-last" aria-labelledby="m-stay-title">
        <div className="m-block-head">
          <h2 id="m-stay-title">Popular stays</h2>
          <Link href="/hotels">
            View all <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
        <div className="m-rail">
          {stays.map((stay) => (
            <Link key={stay.name} href={stay.href} className="m-stay">
              <Image src={stay.image} alt={stay.name} fill sizes="168px" />
              <span aria-hidden>
                <Heart size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
