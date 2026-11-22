"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  hotelResultsHref,
  HOTEL_MAJOR_CITY_OPTIONS,
  type HotelListing,
} from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type DestinationSlide = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  thumbnail: string;
  count: number;
};

const AUTO_SCROLL_MS = 5500;

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type HotelsFeaturedDestinationsProps = {
  hotels?: HotelListing[];
};

export function HotelsFeaturedDestinations({ hotels = [] }: HotelsFeaturedDestinationsProps) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const citySlides = useMemo(() => {
    const grouped = new Map<
      string,
      {
        slug: string;
        name: string;
        hotels: HotelListing[];
      }
    >();

    for (const hotel of hotels) {
      const slug = hotel.citySlug.trim().toLowerCase();
      const current = grouped.get(slug);
      if (current) {
        current.hotels.push(hotel);
      } else {
        grouped.set(slug, {
          slug,
          name: titleCaseSlug(slug),
          hotels: [hotel],
        });
      }
    }

    const preferredOrder = new Map(
      HOTEL_MAJOR_CITY_OPTIONS.map((city, index) => [city.slug.toLowerCase(), index]),
    );

    return [...grouped.values()]
      .sort((a, b) => {
        const aRank = preferredOrder.get(a.slug);
        const bRank = preferredOrder.get(b.slug);
        if (aRank != null && bRank != null) return aRank - bRank;
        if (aRank != null) return -1;
        if (bRank != null) return 1;
        return b.hotels.length - a.hotels.length || a.name.localeCompare(b.name);
      })
      .slice(0, 12)
      .map((entry): DestinationSlide => {
        const heroHotel = entry.hotels[0];
        const image =
          heroHotel?.images[0] ||
          "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=1920&q=80";
        return {
          slug: entry.slug,
          name: entry.name,
          tagline: `${entry.hotels.length} ${entry.hotels.length === 1 ? "property" : "properties"}`,
          description: `Handpicked stays in ${entry.name} — compare rooms, rates, and locations in one place.`,
          image,
          thumbnail: image,
          count: entry.hotels.length,
        };
      });
  }, [hotels]);

  const total = citySlides.length;
  const hasSlides = total > 0;

  const goTo = useCallback(
    (idx: number) => {
      if (!hasSlides) return;
      setActive(((idx % total) + total) % total);
    },
    [hasSlides, total],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (!hasSlides || isPaused) return;
    timerRef.current = setTimeout(() => next(), AUTO_SCROLL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasSlides, isPaused, next]);

  useEffect(() => {
    const container = thumbRef.current;
    if (!container) return;
    const el = container.children[active] as HTMLElement | undefined;
    if (!el) return;
    container.scrollTo({
      left: el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  const dest = citySlides[active];
  const safeDest = dest ?? {
    slug: "anjuna",
    name: "Anjuna",
    tagline: "City stays",
    description: "Handpicked stays in Anjuna — compare rooms, rates, and locations in one place.",
    image: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=400&q=80",
    count: 0,
  };

  return (
    <section
      id="popular-destinations"
      className="scroll-mt-24 bg-[#f7faf9] py-12 sm:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
            Destinations
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#667085] sm:text-base">
            Browse cities with live inventory — tap a place and start comparing stays.
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl sm:mt-10">
          <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[480px]">
            <Image
              key={safeDest.slug}
              src={safeDest.image}
              alt={safeDest.name}
              fill
              unoptimized
              className="object-cover transition-opacity duration-700"
              sizes="(max-width: 768px) 100vw, 1180px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081816]/85 via-[#081816]/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#081816]/55 via-transparent to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#99f6e4]">
                Featured city
              </p>
              <h3 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                {safeDest.name}
              </h3>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-white/80 sm:text-[15px]">
                {safeDest.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={hotelResultsHref(safeDest.slug)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3 text-[13px] font-extrabold text-white transition hover:bg-[#0d9488]"
                >
                  View stays
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-md">
                  <MapPin className="h-3.5 w-3.5 text-[#99f6e4]" aria-hidden />
                  {safeDest.tagline}
                </span>
              </div>
            </div>
          </div>

          {hasSlides ? (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#15202b] shadow-md transition hover:bg-white sm:left-4"
                aria-label="Previous destination"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#15202b] shadow-md transition hover:bg-white sm:right-4"
                aria-label="Next destination"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </>
          ) : null}
        </div>

        <div
          ref={thumbRef}
          className="mt-5 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-6 sm:gap-4"
        >
          {(hasSlides ? citySlides : [safeDest]).map((d, i) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "group relative h-[88px] w-[132px] shrink-0 overflow-hidden rounded-2xl transition sm:h-[100px] sm:w-[148px]",
                i === active
                  ? "ring-2 ring-[#0f766e] ring-offset-2 ring-offset-[#f7faf9]"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={d.thumbnail}
                alt={d.name}
                fill
                unoptimized
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="148px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5 text-left">
                <p className="truncate text-[12px] font-bold text-white">{d.name}</p>
                <p className="truncate text-[10px] text-white/70">{d.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
