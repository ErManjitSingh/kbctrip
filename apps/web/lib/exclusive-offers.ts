import { hotelResultsHref, type HotelListing } from "@/lib/hotels-catalog";
import { formatInrAmount } from "@/lib/utils";

export type ExclusiveOffer = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=1200&q=80";

const DESTINATION_DEALS: {
  id: string;
  slug: string;
  city: string;
  badge: string;
  fallbackImage: string;
  tagline: string;
}[] = [
  {
    id: "deal-manali",
    slug: "manali",
    city: "Manali",
    badge: "Hotel deal",
    tagline: "Snow peaks & valley stays",
    fallbackImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  },
  {
    id: "deal-dharamshala",
    slug: "dharamshala",
    city: "Dharamshala",
    badge: "Hotel deal",
    tagline: "Hill stays with mountain views",
    fallbackImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80",
  },
  {
    id: "deal-shimla",
    slug: "shimla",
    city: "Shimla",
    badge: "Hotel deal",
    tagline: "Colonial charm & Mall Road",
    fallbackImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
  },
];

function pickBestHotel(hotels: HotelListing[], citySlug: string): HotelListing | null {
  const matches = hotels.filter(
    (hotel) => hotel.citySlug.trim().toLowerCase() === citySlug.toLowerCase(),
  );
  if (!matches.length) return null;
  return [...matches].sort(
    (a, b) =>
      b.reviewCount - a.reviewCount ||
      b.rating - a.rating ||
      a.price - b.price,
  )[0] ?? null;
}

/**
 * Destination deal cards for the hotels landing page.
 * Click opens that city’s hotel results; subtitle surfaces a best hotel when available.
 */
export function getDestinationHotelDeals(hotels: HotelListing[] = []): ExclusiveOffer[] {
  return DESTINATION_DEALS.map((deal) => {
    const best = pickBestHotel(hotels, deal.slug);
    const hotelName = best?.name?.trim();
    const price = best?.price && best.price > 0 ? best.price : null;
    const image = best?.images?.[0] || deal.fallbackImage || FALLBACK_IMAGE;

    return {
      id: deal.id,
      title: deal.city,
      badge: deal.badge,
      href: hotelResultsHref(deal.slug),
      image,
      subtitle: hotelName
        ? price
          ? `${hotelName} · from ₹${formatInrAmount(price)}/night`
          : `${hotelName} · ${deal.tagline}`
        : deal.tagline,
    };
  });
}

/**
 * Curated guest offers for hotels / packages.
 * Served by GET /api/offers — keep in sync with live KBC catalog slugs.
 */
export function getExclusiveOffers(): ExclusiveOffer[] {
  return getDestinationHotelDeals();
}
