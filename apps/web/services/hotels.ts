export {
  searchHotels,
  fetchFeaturedHotels,
  fetchAllHotels,
  fetchHotelDetail,
  fetchRelatedHotels,
  fetchHotelSlugs,
  fetchPopularDestinations,
  fetchDestinationBySlug,
  fetchHotelDestinations,
  fetchHotelLocalities,
  getHotelDetailBundle,
  resolveHotelCity,
  resolveHotelBookingSelection,
  mapApiHotelToListing,
  citySlugFromName,
} from "@/lib/hotels-api";

export type {
  ApiHotel,
  ApiHotelDetail,
  HotelListing,
  HotelSearchParams,
  HotelDetailBundle,
  HotelDestinationListing,
} from "@/lib/hotels-api";

import {
  searchHotels,
  fetchFeaturedHotels,
  fetchAllHotels,
  fetchRelatedHotels,
  fetchHotelDetail,
} from "@/lib/hotels-api";

export { fetchAllHotels as getAllHotels };

export async function getFeaturedHotels(limit?: number) {
  const { hotels } = await fetchAllHotels(limit ?? 50);
  if (hotels.length > 0) return limit ? hotels.slice(0, limit) : hotels;
  const featured = await fetchFeaturedHotels();
  return limit ? featured.slice(0, limit) : featured;
}

export async function getHotelBySlug(city: string, slug: string, checkIn?: string, checkOut?: string) {
  return fetchHotelDetail(city, slug, checkIn, checkOut);
}

export async function getRelatedHotels(hotelId: string, limit = 4) {
  return fetchRelatedHotels(hotelId, limit);
}

export async function getHotelAvailability(hotelId: string, roomTypeId: string, checkIn?: string, checkOut?: string) {
  void hotelId;
  void roomTypeId;
  void checkIn;
  void checkOut;
  // Room availability comes from KBC booking API (getAvailability) on stay detail flows — not Unotrips.
  return { ok: false as const, data: null, message: "Use KBC property availability" };
}
