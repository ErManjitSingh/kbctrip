export type ExclusiveOffer = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge: string;
};

function mediaBase() {
  const api =
    process.env.NEXT_PUBLIC_KBC_BOOKING_API_URL ??
    process.env.KBC_BOOKING_API_URL ??
    "http://localhost:4000/api";
  // media is served from API host root, not under /api
  return api.replace(/\/api\/?$/, "");
}

/**
 * Curated guest offers for hotels / packages.
 * Served by GET /api/offers — keep in sync with live KBC catalog slugs.
 */
export function getExclusiveOffers(): ExclusiveOffer[] {
  const media = mediaBase();
  return [
    {
      id: "offer-anjuna-jacuzzi",
      title: "Anjuna Pool & Jacuzzi Studio",
      subtitle: "From ₹1,900/night — HomeyHuts premium villa stay",
      href: "/hotel/anjuna/homeyhuts-anjuna-4882",
      image: `${media}/media/properties/homeyhuts-anjuna-4882/1.webp`,
      badge: "Hot deal",
    },
    {
      id: "offer-goa-beach-escape",
      title: "Goa Beach Escape",
      subtitle: "5D/4N from Delhi — stay, breakfast & transfers included",
      href: "/packages/goa-beach-escape",
      image: `${media}/media/properties/homeyhuts-anjuna-4881/1.webp`,
      badge: "Package deal",
    },
    {
      id: "offer-anjuna-pool-suite",
      title: "Anjuna Poolside Getaway",
      subtitle: "Weekend special — save on 2+ night HomeyHuts bookings",
      href: "/hotel/anjuna/homeyhuts-anjuna-4884",
      image: `${media}/media/properties/homeyhuts-anjuna-4884/1.webp`,
      badge: "Limited time",
    },
  ];
}
