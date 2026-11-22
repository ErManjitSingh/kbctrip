"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { hotelResultsHref, type HotelListing } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const STAR_FILTERS = [
  { label: "Hotels", stars: undefined },
  { label: "Cheapest Hotels", stars: undefined, sortHint: "cheap" },
  { label: "3 Star Hotels", stars: 3 },
  { label: "4 Star Hotels", stars: 4 },
  { label: "5 Star Hotels", stars: 5 },
] as const;

type HotelsFeaturedDestinationsProps = {
  hotels?: HotelListing[];
};

export function HotelsFeaturedDestinations({ hotels = [] }: HotelsFeaturedDestinationsProps) {
  const [showAll, setShowAll] = useState(false);

  const cities = useMemo(() => {
    const grouped = new Map<
      string,
      { slug: string; name: string; image: string; count: number }
    >();

    for (const hotel of hotels) {
      const slug = hotel.citySlug.trim().toLowerCase();
      if (!slug) continue;
      const current = grouped.get(slug);
      if (current) {
        current.count += 1;
        if (!current.image && hotel.images[0]) current.image = hotel.images[0];
      } else {
        grouped.set(slug, {
          slug,
          name: titleCaseSlug(slug),
          image:
            hotel.images[0] ||
            "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=800&q=80",
          count: 1,
        });
      }
    }

    return [...grouped.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [hotels]);

  const visible = showAll ? cities : cities.slice(0, 12);

  return (
    <section id="popular-destinations" className="scroll-mt-24 bg-white py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
        <h2 className="text-center text-[22px] font-bold tracking-tight text-[#212121] sm:text-[26px]">
          Book Hotels at Popular Destinations
        </h2>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((city) => (
            <div
              key={city.slug}
              className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
            >
              <Link href={hotelResultsHref(city.slug)} className="group relative block h-[132px]">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  unoptimized
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-[16px] font-bold text-white drop-shadow">
                  {city.name}
                </span>
              </Link>
              <div className="px-3 py-2.5">
                <p className="flex flex-wrap gap-x-1 gap-y-0.5 text-[11px] leading-relaxed text-[#616161]">
                  {STAR_FILTERS.map((filter, index) => (
                    <span key={filter.label} className="inline-flex items-center">
                      <Link
                        href={hotelResultsHref(city.slug)}
                        className="font-medium text-[#1976d2] hover:underline"
                      >
                        {filter.label}
                      </Link>
                      {index < STAR_FILTERS.length - 1 ? (
                        <span className="ml-1 text-[#bdbdbd]">,</span>
                      ) : null}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {cities.length > 12 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className={cn(
                "rounded-full border border-[#2196f3] px-6 py-2.5 text-[13px] font-bold text-[#2196f3] transition hover:bg-[#e3f2fd]",
              )}
            >
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
