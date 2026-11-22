import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { HotelsSearchHero } from "@/components/hotels/hotels-search-hero";
import { HotelsFeaturedDestinations } from "@/components/hotels/hotels-featured-destinations";
import { HotelsExclusiveOffers } from "@/components/hotels/hotels-exclusive-offers";
import { HotelsPopularHotelsSection } from "@/components/hotels/hotels-popular-hotels-section";
import { HotelsPageCta } from "@/components/hotels/hotels-page-cta";
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
      <HotelsPopularHotelsSection
        hotels={featuredHotels}
        viewMoreHref="/hotels#popular-destinations"
      />
      <HotelsExclusiveOffers offers={offers} />
      <HotelsPageCta />
    </>
  );
}

function HotelsSectionsFallback() {
  return (
    <div className="bg-[#f7faf9]">
      <HotelsPopularDestinationsSkeleton />
    </div>
  );
}

export default async function HotelsPage() {
  const { hotels: featuredDestinationHotels } = await fetchAllHotels(120);

  return (
    <>
      <main className="min-h-screen bg-[#f7faf9]">
        <HotelsSearchHero
          defaultCity="Anjuna"
          defaultCountry="India"
          defaultSlug="anjuna"
        />
        <HotelsFeaturedDestinations hotels={featuredDestinationHotels} />
        <Suspense fallback={<HotelsSectionsFallback />}>
          <HotelsDynamicSections featuredHotels={featuredDestinationHotels} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
