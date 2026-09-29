'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  formatPrice,
  listHolidayPackages,
  listProperties,
  type MarketplaceHolidayPackage,
  type MarketplaceProperty,
} from '@/lib/booking-api';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

function photoOf(urls: string[] | undefined, fallback: string) {
  const first = urls?.find(Boolean);
  return first || fallback;
}

function CatalogSkeleton({ label }: { label: string }) {
  return (
    <section className="home-band" aria-busy="true" aria-label={`Loading ${label}`}>
      <div className="page-width">
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="mb-8 h-9 w-72 max-w-full" />
        <div className="home-card-grid home-card-grid-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
    void listHolidayPackages({ limit: 6, page: 1, sort: 'popular' })
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
            <p className="home-section-lead">Itineraries with stays and transfers — from the live catalog.</p>
          </div>
          <Link href="/packages" className="home-section-link">
            All packages <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="home-card-grid home-card-grid-3">
          {packs.slice(0, 6).map((pack) => (
            <Link key={pack.id} href={`/packages/${pack.slug}`} className="home-product-card">
              <span className="home-product-media kbc-media-cover">
                <Image
                  src={photoOf(pack.photos, '/reference/destination-backgrounds/goa-bg.png')}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 90vw, 33vw"
                  unoptimized
                />
                {pack.badge ? <span className="home-product-badge">{pack.badge}</span> : null}
              </span>
              <span className="home-product-body">
                <span className="home-product-meta">
                  {pack.destination} · {pack.days}D / {pack.nights}N
                </span>
                <strong>{pack.title}</strong>
                <b>
                  {formatPrice(pack.pricePerPersonMinor, pack.currency)}
                  <small>/ person</small>
                </b>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeStaysSection() {
  const [stays, setStays] = useState<MarketplaceProperty[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listProperties(undefined, 1, 6)
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
            <p className="home-section-lead">Verified properties — photos and rates from ops.</p>
          </div>
          <Link href="/hotels" className="home-section-link">
            Browse stays <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="home-card-grid home-card-grid-3">
          {stays.slice(0, 6).map((stay) => (
            <Link key={stay.id} href={`/hotel/${stay.slug}`} className="home-product-card">
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
                  {[stay.city, stay.state].filter(Boolean).join(', ') || 'India'}
                </span>
                <strong>{stay.name}</strong>
                <b>
                  {stay.startingPriceMinor != null
                    ? formatPrice(stay.startingPriceMinor, stay.currency)
                    : 'View rates'}
                  {stay.startingPriceMinor != null ? <small>/ night</small> : null}
                </b>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
