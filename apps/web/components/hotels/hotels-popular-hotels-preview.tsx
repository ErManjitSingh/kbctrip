"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HotelGridCard } from "@/components/hotels/hotel-grid-card";
import type { HotelListing } from "@/lib/hotels-catalog";

const POPULAR_LIMIT = 8;

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
    <section className="bg-white py-10 sm:py-12" id="popular-hotels">
      <div className="mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-[#212121] sm:text-[26px]">
              Popular Hotels Across India
            </h2>
            <p className="mt-1 text-[13px] text-[#757575]">
              Top-rated stays loved by travellers — book with clear prices.
            </p>
          </div>
          <Link
            href={viewMoreHref}
            className="inline-flex w-fit items-center gap-1.5 text-[13px] font-bold text-[#1976d2] hover:underline"
          >
            View more
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((hotel) => (
            <HotelGridCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>
    </section>
  );
}
