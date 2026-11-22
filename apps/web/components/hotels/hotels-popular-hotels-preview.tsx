"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HotelGridCard } from "@/components/hotels/hotel-grid-card";
import { HotelsSectionHeader } from "@/components/hotels/hotels-section-header";
import type { HotelListing } from "@/lib/hotels-catalog";

const POPULAR_LIMIT = 4;

type HotelsPopularHotelsPreviewProps = {
  hotels: HotelListing[];
  viewMoreHref: string;
};

function pickPopularHotels(hotels: HotelListing[]): HotelListing[] {
  return [...hotels]
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
    .slice(0, POPULAR_LIMIT);
}

export function HotelsPopularHotelsPreview({ hotels, viewMoreHref }: HotelsPopularHotelsPreviewProps) {
  const popular = pickPopularHotels(hotels);

  return (
    <section className="bg-[#f7faf9] py-12 sm:py-16 lg:py-20" id="popular-hotels">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <HotelsSectionHeader
            eyebrow="Guest favourites"
            title="Popular stays"
            description="Top-rated rooms travellers keep coming back to — comfort, location, and fair rates."
          />
          <Link
            href={viewMoreHref}
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#d9ebe7] bg-white px-4 py-2.5 text-[13px] font-bold text-[#0f766e] transition hover:border-[#0f766e] hover:bg-[#f0fdfa]"
          >
            Browse destinations
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {popular.map((hotel) => (
            <HotelGridCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href={viewMoreHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-6 py-3 text-[13px] font-extrabold text-white transition hover:bg-[#0d9488]"
          >
            View more hotels
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
