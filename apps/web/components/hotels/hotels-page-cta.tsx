import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { HotelListing } from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

type HotelsPageCtaProps = {
  searchHref?: string;
  exploreHref?: string;
  hotel?: HotelListing | null;
};

export function HotelsPageCta({
  searchHref = "/hotels#hotel-search",
  exploreHref = "/hotels#popular-destinations",
}: HotelsPageCtaProps) {
  return (
    <section className="bg-[#f7faf9] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0f766e]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%),linear-gradient(135deg,rgba(13,148,136,0.35),transparent_50%)]"
            aria-hidden
          />
          <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99f6e4]">
              {TRAVEL_HOME_BRAND.name}
            </p>
            <h2 className="mx-auto mt-3 max-w-[16ch] font-display text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              Ready when you are
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base">
              Search by city, compare rooms instantly, and book with clear prices — support on every stay.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={searchHref}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13px] font-extrabold text-[#0f766e] transition hover:bg-[#f0fdfa]"
              >
                <Search className="h-4 w-4" aria-hidden />
                Search hotels
              </Link>
              <Link
                href={exploreHref}
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-[13px] font-extrabold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Explore destinations
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
