import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { HotelsSearchHero } from "@/components/hotels/hotels-search-hero";
import { HotelsFeaturedDestinations } from "@/components/hotels/hotels-featured-destinations";
import { HotelsExclusiveOffers } from "@/components/hotels/hotels-exclusive-offers";
import { HotelsPopularHotelsSection } from "@/components/hotels/hotels-popular-hotels-section";
import { HotelsMoodEscapes } from "@/components/hotels/hotels-mood-escapes";
import { HotelsWhyBook } from "@/components/hotels/hotels-why-book";
import { fetchAllHotels } from "@/lib/hotels-api";
import { getExclusiveOffers } from "@/lib/exclusive-offers";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";
import { HotelsPopularDestinationsSkeleton } from "@/components/hotels/hotels-page-skeleton";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Hotels | ${TRAVEL_HOME_BRAND.name} — Same hotel, cheapest price`,
  description:
    "Search hotels by city, check-in dates, and guests. Exclusive offers and lowest price guarantee with KBC Trip.",
};

async function HotelsDynamicSections({
  featuredHotels,
}: {
  featuredHotels: Awaited<ReturnType<typeof fetchAllHotels>>["hotels"];
}) {
  const offers = getExclusiveOffers();

  return (
    <>
      <HotelsExclusiveOffers offers={offers} />
      <HotelsMoodEscapes />
      <HotelsFeaturedDestinations hotels={featuredHotels} />
      <HotelsPopularHotelsSection
        hotels={featuredHotels}
        viewMoreHref="/hotels#popular-destinations"
      />
      <HotelsWhyBook />
    </>
  );
}

function HotelsSectionsFallback() {
  return (
    <div className="bg-white">
      <HotelsPopularDestinationsSkeleton />
    </div>
  );
}

export default async function HotelsPage() {
  const { hotels: featuredDestinationHotels } = await fetchAllHotels(120);

  return (
    <>
      <main className="min-h-screen bg-white">
        <HotelsSearchHero
          defaultCity="Anjuna"
          defaultCountry="India"
          defaultSlug="anjuna"
        />
        <Suspense fallback={<HotelsSectionsFallback />}>
          <HotelsDynamicSections featuredHotels={featuredDestinationHotels} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
