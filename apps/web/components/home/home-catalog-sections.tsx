'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bath,
  BedDouble,
  Car,
  Check,
  Coffee,
  Compass,
  CookingPot,
  MapPin,
  Plane,
  UserRound,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import {
  formatPrice,
  listHolidayPackages,
  listProperties,
  type MarketplaceHolidayPackage,
  type MarketplaceProperty,
} from '@/lib/booking-api';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { packageCoverUrls } from '@/lib/package-cover';

function photoOf(urls: string[] | undefined, fallback: string) {
  const first = urls?.find(Boolean);
  if (!first) return fallback;
  if (first.includes('images.unsplash.com')) {
    return first.replace(/([?&])w=\d+/, '$1w=800').replace(/([?&])q=\d+/, '$1q=70');
  }
  return first;
}

function clip(text: string | null | undefined, max = 88) {
  const clean = text?.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function amenityFact(name: string): { Icon: LucideIcon; label: string; rank: number } | null {
  const n = name.toLowerCase();
  if (/listing|homey|imported/.test(n)) return null;
  if (/wifi|wi-fi|internet/.test(n)) return { Icon: Wifi, label: 'Wi-Fi', rank: 0 };
  if (/breakfast/.test(n)) return { Icon: Coffee, label: 'Breakfast', rank: 1 };
  if (/meal/.test(n)) return { Icon: UtensilsCrossed, label: 'Meals', rank: 2 };
  if (/jacuzzi/.test(n)) return { Icon: Waves, label: 'Jacuzzi', rank: 3 };
  if (/pool|swim/.test(n)) return { Icon: Waves, label: 'Pool', rank: 3 };
  if (/park/.test(n)) return { Icon: Car, label: 'Parking', rank: 4 };
  if (/kitchen/.test(n)) return { Icon: CookingPot, label: 'Kitchen', rank: 5 };
  return { Icon: Check, label: name.length > 18 ? `${name.slice(0, 16).trimEnd()}…` : name, rank: 8 };
}

function stayLayout(stay: MarketplaceProperty) {
  const text = `${stay.name} ${stay.description ?? ''}`;
  const rooms = text.match(/(\d+)\s+bedrooms?/i);
  const baths = text.match(/(\d+)\s+bathrooms?/i);
  const guests = text.match(/up to\s+(\d+)\s+guests?/i);
  const facts: { Icon: LucideIcon; label: string }[] = [];
  if (rooms) {
    const n = Number(rooms[1]);
    facts.push({ Icon: BedDouble, label: `${n} bedroom${n === 1 ? '' : 's'}` });
  }
  if (baths) {
    const n = Number(baths[1]);
    facts.push({ Icon: Bath, label: `${n} bath${n === 1 ? '' : 's'}` });
  }
  if (guests) facts.push({ Icon: Users, label: `${guests[1]} guests` });
  return facts;
}

function stayFacts(stay: MarketplaceProperty) {
  const fromName: { Icon: LucideIcon; label: string; rank: number }[] = [];
  if (/jacuzzi/i.test(stay.name)) fromName.push({ Icon: Waves, label: 'Jacuzzi', rank: 3 });
  else if (/pool/i.test(stay.name)) fromName.push({ Icon: Waves, label: 'Pool', rank: 3 });
  const seen = new Set<string>();
  return [...stay.amenities.map(amenityFact), ...fromName]
    .flatMap((item) => (item ? [item] : []))
    .sort((a, b) => a.rank - b.rank)
    .filter((item) => {
      if (seen.has(item.label)) return false;
      seen.add(item.label);
      return true;
    })
    .slice(0, 3);
}

function inclusionFact(name: string): { Icon: LucideIcon; label: string } {
  const n = name.toLowerCase();
  if (/flight|airfare/.test(n)) return { Icon: Plane, label: 'Flights' };
  if (/transfer|cab|airport|ferry/.test(n)) return { Icon: Car, label: 'Transfers' };
  if (/breakfast/.test(n)) return { Icon: Coffee, label: 'Breakfast' };
  if (/meal|dinner|lunch/.test(n)) return { Icon: UtensilsCrossed, label: 'Meals' };
  if (/stay|hotel|houseboat|resort/.test(n)) return { Icon: BedDouble, label: 'Stay' };
  if (/guide|permit/.test(n)) return { Icon: UserRound, label: 'Guide' };
  if (/shikara/.test(n)) return { Icon: Compass, label: 'Shikara' };
  if (/bonfire/.test(n)) return { Icon: Check, label: 'Bonfire' };
  if (/sight|tour|safari|palace|fort|walk|aarti|cruise|boat|snorkel|raft|trip/.test(n)) {
    return { Icon: Compass, label: 'Sightseeing' };
  }
  const short = name.split(/\s+/).slice(0, 2).join(' ');
  return { Icon: Check, label: short.length > 16 ? short.slice(0, 14) : short };
}

function stayTitle(name: string) {
  return name.replace(/\s*_\d+$/, '').trim();
}

function stayHref(stay: MarketplaceProperty) {
  const city = (stay.city || 'india').trim().toLowerCase().replace(/\s+/g, '-');
  return `/hotel/${encodeURIComponent(city)}/${encodeURIComponent(stay.slug)}`;
}

function packageFacts(pack: MarketplaceHolidayPackage) {
  const seen = new Set<string>();
  return pack.inclusions
    .map(inclusionFact)
    .filter((item) => {
      if (seen.has(item.label)) return false;
      seen.add(item.label);
      return true;
    })
    .slice(0, 3);
}

function TripPhoto({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0);
  const src = urls[index] ?? '/images/home/lite/card-lodge.jpg';
  return (
    <img
      className="home-trip-photo"
      src={src}
      alt=""
      onError={() => setIndex((current) => (current + 1 < urls.length ? current + 1 : current))}
    />
  );
}

function CatalogSkeleton({ label }: { label: string }) {
  return (
    <section className="home-band" aria-busy="true" aria-label={`Loading ${label}`}>
      <div className="page-width">
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="mb-8 h-9 w-72 max-w-full" />
        <div className="home-card-grid home-card-grid-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="home-product-card pointer-events-none">
              <Skeleton className="aspect-[16/11] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePackagesSection() {
  const [packs, setPacks] = useState<MarketplaceHolidayPackage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listHolidayPackages({ limit: 4, page: 1, sort: 'popular' })
      .then((data) => {
        if (!cancelled) setPacks(data?.packages ?? []);
      })
      .catch(() => {
        if (!cancelled) setPacks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (packs === null) return <CatalogSkeleton label="packages" />;

  if (!packs.length) {
    return (
      <section className="home-band home-band-packages" aria-labelledby="home-packages-title">
        <div className="page-width">
          <p className="section-kicker">Holiday packages</p>
          <h2 id="home-packages-title" className="sr-only">
            Packages
          </h2>
          <EmptyState
            title="Packages are updating"
            body="Browse the full catalog while we refresh featured trips."
            href="/packages"
            actionLabel="Explore packages"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="home-band home-band-packages" aria-labelledby="home-packages-title">
      <div className="page-width">
        <div className="home-section-head">
          <div>
            <p className="section-kicker">Holiday packages</p>
            <h2 id="home-packages-title">Curated trips, ready to book</h2>
            <p className="home-section-lead">Stays and transfers, priced per person.</p>
          </div>
          <Link href="/packages" className="home-section-link">
            View all <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="home-trip-grid">
          {packs.slice(0, 4).map((pack) => {
            const facts = packageFacts(pack);
            return (
              <Link key={pack.id} href={`/packages/${pack.slug}`} className="home-trip-card">
                <TripPhoto urls={packageCoverUrls(pack.destination, pack.photos)} />
                <span className="home-trip-shade" aria-hidden />
                <span className="home-trip-days">
                  {pack.days}D / {pack.nights}N
                </span>
                <span className="home-trip-copy">
                  <span className="home-trip-place">
                    <MapPin size={13} aria-hidden />
                    {pack.destination}
                  </span>
                  <strong>{pack.title}</strong>
                  {facts.length ? (
                    <span className="home-trip-facts">
                      {facts.map(({ label }) => (
                        <span key={label}>{label}</span>
                      ))}
                    </span>
                  ) : null}
                  <em>
                    From {formatPrice(pack.pricePerPersonMinor, pack.currency)}
                    <small>/ person</small>
                  </em>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeStaysSection() {
  const [stays, setStays] = useState<MarketplaceProperty[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listProperties(undefined, 1, 4)
      .then((data) => {
        if (!cancelled) setStays(data?.properties ?? []);
      })
      .catch(() => {
        if (!cancelled) setStays([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (stays === null) return <CatalogSkeleton label="stays" />;

  if (!stays.length) {
    return (
      <section className="home-band home-band-stays" aria-labelledby="home-stays-title">
        <div className="page-width">
          <p className="section-kicker">Hotels &amp; stays</p>
          <h2 id="home-stays-title" className="sr-only">
            Stays
          </h2>
          <EmptyState
            title="Stays are updating"
            body="Search hotels by city while we refresh featured properties."
            href="/hotels"
            actionLabel="Browse stays"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="home-band home-band-stays" aria-labelledby="home-stays-title">
      <div className="page-width">
        <div className="home-section-head">
          <div>
            <p className="section-kicker">Hotels &amp; stays</p>
            <h2 id="home-stays-title">Places guests actually book</h2>
            <p className="home-section-lead">Photos, amenities, and a nightly rate.</p>
          </div>
          <Link href="/hotels" className="home-section-link">
            View all <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="home-card-grid home-card-grid-4">
          {stays.slice(0, 4).map((stay) => {
            const place = [stay.city, stay.state].filter(Boolean).join(', ') || stay.country || 'India';
            const layout = stayLayout(stay);
            const facts = stayFacts(stay);
            const blurb = layout.length || facts.length ? null : clip(stay.description);
            return (
              <Link key={stay.id} href={stayHref(stay)} className="home-product-card">
                <span className="home-product-media kbc-media-cover">
                  <Image
                    src={photoOf(stay.photos, '/reference/service-cards/hotels.png')}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 90vw, 33vw"
                    unoptimized
                  />
                </span>
                <span className="home-product-body">
                  <span className="home-product-meta">
                    <MapPin size={13} aria-hidden />
                    {place}
                  </span>
                  <strong>{stayTitle(stay.name)}</strong>
                  {layout.length ? (
                    <span className="home-product-facts">
                      {layout.map(({ Icon, label }) => (
                        <span key={label}>
                          <Icon size={13} aria-hidden />
                          {label}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {facts.length ? (
                    <span className="home-chip-row" aria-label="Amenities">
                      {facts.map(({ Icon, label }) => (
                        <span key={label} className="home-chip">
                          <Icon size={12} aria-hidden />
                          {label}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {blurb ? <span className="home-product-blurb">{blurb}</span> : null}
                  <b>
                    {stay.startingPriceMinor != null ? <small>From</small> : null}
                    {stay.startingPriceMinor != null
                      ? formatPrice(stay.startingPriceMinor, stay.currency)
                      : 'View rates'}
                    {stay.startingPriceMinor != null ? <small>/ night</small> : null}
                  </b>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
