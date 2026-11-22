import { HotelsPopularHotelsPreview } from "@/components/hotels/hotels-popular-hotels-preview";
import { fetchAllHotels, fetchFeaturedHotels } from "@/lib/hotels-api";
import type { HotelListing } from "@/lib/hotels-catalog";

type HotelsPopularHotelsSectionProps = {
  viewMoreHref: string;
  hotels?: HotelListing[];
};

export async function HotelsPopularHotelsSection({ viewMoreHref, hotels: hotelsProp }: HotelsPopularHotelsSectionProps) {
  const featuredHotels = hotelsProp ?? (await fetchFeaturedHotels());
  const hotels =
    featuredHotels.length >= 8
      ? featuredHotels
      : await fetchAllHotels(12).then(({ hotels: allHotels }) => {
          const map = new Map<string, HotelListing>();
          for (const hotel of [...featuredHotels, ...allHotels]) {
            map.set(hotel.id, hotel);
          }
          return Array.from(map.values());
        });

  if (!hotels.length) {
    return (
      <section className="bg-[#f7faf9] py-12 sm:py-16" id="popular-hotels">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-[#d9ebe7] bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-[#15202b]">No popular hotels right now</p>
            <p className="mt-2 text-sm text-[#667085]">Please check back soon or try another destination.</p>
          </div>
        </div>
      </section>
    );
  }

  return <HotelsPopularHotelsPreview hotels={hotels} viewMoreHref={viewMoreHref} />;
}
