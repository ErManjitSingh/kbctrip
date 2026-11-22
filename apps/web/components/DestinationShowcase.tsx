'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatPrice,
  listHolidayPackages,
  resolveMediaUrl,
  type MarketplaceHolidayPackage,
} from '@/lib/booking-api';

type DestinationSeed = {
  name: string;
  match: RegExp[];
  image: string;
};

/** Clean destinations for “Where to next” — not raw package title strings. */
const DESTINATION_SEEDS: DestinationSeed[] = [
  { name: 'Manali', match: [/\bmanali\b/i], image: '/images/home/lite/dest-manali.jpg' },
  { name: 'Shimla', match: [/\bshimla\b/i, /\bshimal\b/i], image: '/images/home/lite/dest-shimla.jpg' },
  { name: 'Kashmir', match: [/\bkashmir\b/i, /\bsrinagar\b/i, /\bgulmarg\b/i, /\bpahalgam\b/i], image: '/images/home/lite/dest-kashmir.jpg' },
  { name: 'Goa', match: [/\bgoa\b/i], image: '/images/home/lite/dest-goa.jpg' },
  { name: 'Dharamshala', match: [/\bdharamshala\b/i, /\bdharmshala\b/i], image: '/images/home/lite/dest-manali.jpg' },
  { name: 'Dalhousie', match: [/\bdalhousie\b/i, /\bdalhausie\b/i], image: '/images/home/lite/dest-shimla.jpg' },
  { name: 'Kerala', match: [/\bkerala\b/i, /\bmunnar\b/i, /\balleppey\b/i], image: '/images/home/slides/dom-kerala.jpg' },
  { name: 'Rajasthan', match: [/\brajasthan\b/i, /\bjaipur\b/i, /\bjodhpur\b/i, /\budaipur\b/i], image: '/images/home/lite/dest-jaipur.jpg' },
  { name: 'Leh', match: [/\bleh\b/i, /\bladakh\b/i], image: '/images/home/slides/dom-ladakh.jpg' },
  { name: 'Sikkim', match: [/\bsikkim\b/i, /\bgangtok\b/i], image: '/images/home/lite/dest-manali.jpg' },
  { name: 'Darjeeling', match: [/\bdarjeeling\b/i], image: '/images/home/lite/dest-shimla.jpg' },
  { name: 'Gujarat', match: [/\bsomnath\b/i, /\bdwarka\b/i, /\bgir\b/i, /\bdiu\b/i, /\bahmedabad\b/i], image: '/images/home/lite/dest-jaipur.jpg' },
];

const PHONE_PICKS = [
  { name: 'Himachal', href: '/packages?q=Himachal', image: '/images/home/lite/dest-manali.jpg' },
  { name: 'Kashmir', href: '/packages?q=Kashmir', image: '/images/home/lite/dest-kashmir.jpg' },
  { name: 'Rajasthan', href: '/packages?q=Rajasthan', image: '/images/home/lite/dest-jaipur.jpg' },
  { name: 'Goa', href: '/packages?q=Goa', image: '/images/home/lite/dest-goa.jpg' },
] as const;

type DestinationCard = {
  name: string;
  count: number;
  minPrice: number;
  currency: string;
  minDays: number;
  maxDays: number;
  photos: string[];
};

function photoUrl(url: string | undefined) {
  if (!url) return '';
  const resolved = resolveMediaUrl(url) || url;
  if (resolved.includes('images.unsplash.com')) {
    return resolved.replace(/([?&])w=\d+/, '$1w=900').replace(/([?&])q=\d+/, '$1q=72');
  }
  return resolved;
}

function packageText(pack: MarketplaceHolidayPackage): string {
  return [pack.destination, pack.title, pack.slug].filter(Boolean).join(' ');
}

function matchSeeds(text: string): DestinationSeed[] {
  return DESTINATION_SEEDS.filter((seed) => seed.match.some((re) => re.test(text)));
}

function cardsFrom(packages: MarketplaceHolidayPackage[]): DestinationCard[] {
  const groups = new Map<string, MarketplaceHolidayPackage[]>();
  for (const seed of DESTINATION_SEEDS) groups.set(seed.name, []);

  for (const pack of packages) {
    const matches = matchSeeds(packageText(pack));
    for (const seed of matches) {
      groups.get(seed.name)?.push(pack);
    }
  }

  return DESTINATION_SEEDS.flatMap((seed) => {
    const items = groups.get(seed.name) ?? [];
    if (!items.length) return [];
    const prices = items.map((item) => item.pricePerPersonMinor).filter((price) => price > 0);
    const days = items.map((item) => item.days).filter((day) => day > 0);
    const remote = items.flatMap((item) => item.photos ?? []).filter(Boolean).map(photoUrl).filter(Boolean);
    return [
      {
        name: seed.name,
        count: items.length,
        minPrice: prices.length ? Math.min(...prices) : 0,
        currency: items[0]?.currency || 'INR',
        minDays: days.length ? Math.min(...days) : 0,
        maxDays: days.length ? Math.max(...days) : 0,
        photos: [seed.image, ...remote],
      },
    ];
  });
}

function CardPhoto({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const src = photos[index];
  if (!src) return null;
  return (
    <img
      className="where-next-photo"
      src={src}
      alt=""
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

function dayLabel(card: DestinationCard) {
  if (!card.minDays) return 'Package ready';
  if (card.minDays === card.maxDays) return `${card.minDays} days`;
  return `${card.minDays}–${card.maxDays} days`;
}

export function DestinationShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<DestinationCard[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const paused = useRef(false);

  useEffect(() => {
    let cancelled = false;
    listHolidayPackages({ limit: 100, sort: 'popular' })
      .then((catalog) => {
        if (cancelled) return;
        const list = catalog?.packages ?? [];
        setCards(cardsFrom(list));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncEdges = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft >= max - 4,
    });
  };

  useEffect(() => {
    syncEdges();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', syncEdges, { passive: true });
    window.addEventListener('resize', syncEdges);
    return () => {
      track.removeEventListener('scroll', syncEdges);
      window.removeEventListener('resize', syncEdges);
    };
  }, [cards]);

  const step = () => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>('.where-next-card');
    if (!track || !card) return 0;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 12;
    return card.getBoundingClientRect().width + gap;
  };

  const move = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    if (direction === 1 && track.scrollLeft >= max - 4) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    track.scrollBy({ left: direction * step(), behavior: 'smooth' });
  };

  useEffect(() => {
    if (!cards?.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (paused.current) return;
      move(1);
    }, 4600);
    return () => window.clearInterval(timer);
  }, [cards]);

  const ready = cards !== null;
  const skeletons = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

  return (
    <section
      className="page-width reference-section destination-section where-next"
      id="popular-destinations"
      aria-labelledby="popular-destinations-title"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={() => { paused.current = false; }}
    >
      <div className="section-heading">
        <div className="section-heading-copy">
          <p className="section-kicker">Destinations</p>
          <h2 id="popular-destinations-title">
            <span className="home-title-desk">Where to next</span>
            <span className="home-title-phone">Popular Destinations</span>
          </h2>
          <p className="home-section-lead">Only places with a package you can book.</p>
        </div>
        <div className="where-next-tools">
          <Link href="/packages" className="home-section-link">
            View all
            <ArrowRight size={15} aria-hidden />
          </Link>
          <button type="button" aria-label="Previous destinations" onClick={() => move(-1)} disabled={!ready || edges.start}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" aria-label="Next destinations" onClick={() => move(1)} disabled={!ready || edges.end}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="where-next-phone">
        {PHONE_PICKS.map((pick) => (
          <Link key={pick.name} href={pick.href} className="where-next-card" aria-label={pick.name}>
            <img className="where-next-photo" src={pick.image} alt="" />
            <span className="where-next-shade" aria-hidden />
            <span className="where-next-copy">
              <strong>{pick.name}</strong>
            </span>
          </Link>
        ))}
      </div>

      {failed || (ready && cards.length === 0) ? (
        <p className="where-next-empty">Packages are updating. The trip list will show here in a moment.</p>
      ) : (
        <div className="where-next-viewport">
          <div className="where-next-track" ref={trackRef}>
            {ready
              ? cards.map((card) => (
                <Link
                  key={card.name}
                  href={`/packages?q=${encodeURIComponent(card.name)}`}
                  className="where-next-card"
                  aria-label={`${card.name}, ${card.count} ${card.count === 1 ? 'package' : 'packages'}, from ${formatPrice(card.minPrice, card.currency)}`}
                >
                  <CardPhoto photos={card.photos} />
                  <span className="where-next-shade" aria-hidden />
                  <span className="where-next-count">
                    {card.count} {card.count === 1 ? 'package' : 'packages'}
                  </span>
                  <span className="where-next-copy">
                    <strong>{card.name}</strong>
                    <span>{dayLabel(card)}</span>
                    <em>From {formatPrice(card.minPrice, card.currency)}</em>
                  </span>
                </Link>
              ))
              : skeletons.map((item) => <span key={item} className="where-next-card is-loading" />)}
          </div>
        </div>
      )}
    </section>
  );
}
