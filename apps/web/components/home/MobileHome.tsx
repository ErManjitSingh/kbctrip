'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Car,
  ChevronDown,
  Compass,
  CreditCard,
  Headphones,
  Heart,
  Map,
  Plane,
  Search,
  Tag,
  Users,
} from 'lucide-react';
import {
  hotelResultsHref,
  matchHotelDestinationFromList,
  HOTEL_MAJOR_CITY_OPTIONS,
  slugifyCityName,
} from '@/lib/hotels-catalog';
import './mobile-home.css';

const tabs = [
  { id: 'stays', label: 'Stays', icon: BedDouble },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'cabs', label: 'Cabs', icon: Car },
  { id: 'packages', label: 'Packages', icon: Map },
  { id: 'experiences', label: 'Experiences', icon: Compass },
] as const;

type TabId = (typeof tabs)[number]['id'];

const places = ['Manali', 'Shimla', 'Kasol', 'Goa', 'Jaipur', 'Kashmir', 'Auli'];

const destinations = [
  { name: 'Manali', href: '/hotels?city=Manali', image: '/reference/destination-backgrounds/manali-bg.png' },
  { name: 'Shimla', href: '/hotels?city=Shimla', image: '/images/brochure-shimla-church.png' },
  { name: 'Kasol', href: '/hotels?city=Kasol', image: '/meta/himachal_special/kullu.webp' },
  { name: 'Auli', href: '/hotels?city=Auli', image: '/images/brochure-kufri-ridge.png' },
];

const stays = [
  { name: 'Riverside lodge', href: '/hotels?city=Manali', image: '/images/brochure-manali-lodge.png' },
  { name: 'Ridge cottage', href: '/hotels?city=Shimla', image: '/images/brochure-shimla-church.png' },
  { name: 'Pine cabin', href: '/hotels?city=Manali', image: '/images/brochure-himalayan-dawn.png' },
  { name: 'Valley stay', href: '/hotels?city=Kasol', image: '/reference/destination-backgrounds/manali-bg.png' },
];

const trust = [
  { icon: BadgeCheck, label: 'Verified stays' },
  { icon: Headphones, label: '24/7 support' },
  { icon: CreditCard, label: 'Secure payments' },
  { icon: Tag, label: 'Best deals' },
  { icon: Users, label: '1.2M+ travellers' },
];

function iso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function MobileHome() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('stays');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [panel, setPanel] = useState<'dates' | 'guests' | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return places;
    return places.filter((place) => place.toLowerCase().includes(needle));
  }, [query]);

  const guestLabel = `${adults} Guest${adults === 1 ? '' : 's'}, ${rooms} Room${rooms === 1 ? '' : 's'}`;
  const dateLabel = checkIn && checkOut ? `${checkIn.slice(8)} – ${checkOut.slice(8)} ${checkOut.slice(5, 7)}` : 'Check in – Check out';

  function submit(event?: React.FormEvent) {
    event?.preventDefault();
    const city = query.trim();
    if (tab === 'flights') {
      router.push('/flights');
      return;
    }
    if (tab === 'experiences') {
      router.push('/experiences');
      return;
    }
    if (tab === 'cabs') {
      router.push(city ? `/cabs?q=${encodeURIComponent(city)}` : '/cabs');
      return;
    }
    if (tab === 'packages') {
      router.push(city ? `/packages?q=${encodeURIComponent(city)}` : '/packages');
      return;
    }
    const today = new Date();
    const start = checkIn ? new Date(checkIn) : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    const end = checkOut ? new Date(checkOut) : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 2);
    const matched = city ? matchHotelDestinationFromList(city, HOTEL_MAJOR_CITY_OPTIONS) : null;
    const slug = matched?.slug || (city ? slugifyCityName(city) : 'goa');
    router.push(
      hotelResultsHref(slug, {
        check_in: iso(start),
        check_out: iso(end),
        rooms,
        guests: adults,
      }),
    );
  }

  return (
    <div className="m-home">
      <section className="m-hero">
        <Image
          className="m-hero-photo"
          src="/images/brochure-himalayan-dawn.png"
          alt=""
          fill
          priority
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

      <form className="m-search" onSubmit={submit}>
        <div className="m-tabs" role="tablist" aria-label="Travel category">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'is-active' : ''}
                onClick={() => setTab(item.id)}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <label className="m-query">
          <Search size={16} aria-hidden />
          <input
            value={query}
            placeholder="Where do you want to go?"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          />
          <button type="submit" aria-label="Search">
            <ArrowRight size={16} />
          </button>
        </label>

        {focused && suggestions.length > 0 ? (
          <div className="m-suggest" role="listbox">
            {suggestions.map((place) => (
              <button
                key={place}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(place);
                  setFocused(false);
                }}
              >
                {place}
              </button>
            ))}
          </div>
        ) : null}

        <div className="m-meta">
          <button type="button" onClick={() => setPanel(panel === 'dates' ? null : 'dates')}>
            <CalendarDays size={15} aria-hidden />
            {dateLabel}
          </button>
          <button type="button" onClick={() => setPanel(panel === 'guests' ? null : 'guests')}>
            <Users size={15} aria-hidden />
            {guestLabel}
            <ChevronDown size={14} aria-hidden />
          </button>
        </div>

        {panel === 'dates' ? (
          <div className="m-panel">
            <label>
              Check in
              <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
            </label>
            <label>
              Check out
              <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
            </label>
          </div>
        ) : null}

        {panel === 'guests' ? (
          <div className="m-panel">
            <div className="m-step">
              <span>Guests</span>
              <button type="button" onClick={() => setAdults((value) => Math.max(1, value - 1))} aria-label="Fewer guests">−</button>
              <b>{adults}</b>
              <button type="button" onClick={() => setAdults((value) => Math.min(10, value + 1))} aria-label="More guests">+</button>
            </div>
            <div className="m-step">
              <span>Rooms</span>
              <button type="button" onClick={() => setRooms((value) => Math.max(1, value - 1))} aria-label="Fewer rooms">−</button>
              <b>{rooms}</b>
              <button type="button" onClick={() => setRooms((value) => Math.min(8, value + 1))} aria-label="More rooms">+</button>
            </div>
          </div>
        ) : null}
      </form>

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
            <Image src="/images/brochure-kufri-ridge.png" alt="" fill sizes="180px" />
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
