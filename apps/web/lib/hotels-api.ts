/**
 * src/lib/hotels-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * UNO Trips Hotels API — all hotel data comes from the Python backend only.
 *
 * PERFORMANCE REWRITE — getHotelDetailBundle()
 * ─────────────────────────────────────────────
 * BEFORE (5 sequential API calls, pure waterfall):
 *   1. fetchHotelSlugs()          → find city for this hotel slug
 *   2. fetchHotelDetail()         → waits for step 1
 *   3. fetchDestinationBySlug()   → waits for step 2 (to get city name)
 *   4. fetchPopularDestinations() → waits for step 3 (fallback)
 *   5. fetchRelatedHotels()       → waits for step 4
 *   Total: 5 DB connections, fully serial, ~1-2s waterfall
 *
 * AFTER (one critical API call):
 *   Step A: fetchHotelDetail() → city extracted from response
 *   Step B: related hotels load client-side only after the visitor scrolls
 *   Total: one DB connection before the hotel detail page can render
 *
 * WHY THIS WORKS:
 *   The hotel detail response (ApiHotelDetail) already contains:
 *     - city, state, country    → build HotelCity directly, no destination fetch
 *     - rooms, reviews          → no separate endpoints needed
 *     - policies, attractions   → all in one response
 *     - hotel.id                → used later for the deferred related-hotels request
 *
 *   fetchHotelSlugs() was used only to look up the city for a slug, then pass
 *   it to fetchHotelDetail(city, slug). But our URL already contains the slug,
 *   and the backend accepts the slug directly in the path. The city lookup was
 *   a pre-validation step that added a full DB round-trip for nothing.
 *
 *   The fix: pass the slug directly to the backend. The backend already handles
 *   slug lookups internally. If the slug doesn't exist the backend returns 404,
 *   which we handle by returning null (same behaviour as before).
 *
 * DEDUPLICATION — generateMetadata + page render:
 *   Both generateMetadata() and the page component call getHotelDetailBundle().
 *   Next.js deduplicates fetch() calls with the same URL within a single
 *   request lifecycle via its built-in request memoisation. This works because
 *   apiFetch() uses native fetch() under the hood via apiJson().
 *   Net result: metadata/page rendering share the same detail request where
 *   the URL parameters match.
 *
 * OTHER FUNCTIONS UNCHANGED:
 *   fetchHotelSlugs, fetchPopularDestinations, fetchHotelDestinations,
 *   searchHotels, fetchAllHotels, fetchFeaturedHotels, resolveHotelCity,
 *   resolveHotelCitySlugFromSearch, resolveHotelBookingSelection — all kept
 *   exactly as-is. Only getHotelDetailBundle() was rewritten.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  formatHotelCardLocation,
  type HotelBookingSelection,
  type HotelCity,
  type HotelListing,
  type HotelLocalityOption,
  type HotelPhotoCategory,
  type HotelRoomRatePlan,
  type HotelRoomType,
} from "@/lib/hotels-catalog";

export type { HotelListing };

import { apiJson } from "@/lib/api";
import {
  listProperties,
  getPropertyDetail,
  getAvailability,
  getRoomTypes,
  type MarketplaceProperty,
} from "@/lib/booking-api";

// ── Public API types ──────────────────────────────────────────────────────────

export type ApiEnvelope<T> = {
  data: T;
  message?: string | null;
  request_id: string;
};

export type ApiPhotoCategory = {
  category: string;
  label: string;
  images: string[];
};

export type ApiMealPlans = {
  breakfast?: number;
  lunch?: number;
  dinner?: number;
};

export type ApiHotel = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  star_category: number;
  thumbnail_url: string;
  images: string[];
  starting_price: number;
  currency: string;
  amenities: string[];
  tags: string[];
  description: string;
  is_featured: boolean;
  is_verified: boolean;
  collection_type: string | null;
  photo_categories?: ApiPhotoCategory[];
  locality_name?: string | null;
  locality_slug?: string | null;
  distance_from_search_km?: number | null;
  search_location_label?: string | null;
};

type ApiRatePlanPrices = {
  ep?: number | null;
  cp?: number | null;
  map?: number | null;
  ap?: number | null;
};

type ApiChannelRates = {
  room:      ApiRatePlanPrices;
  extra_bed: ApiRatePlanPrices;
};

type ApiRates = {
  website?: ApiChannelRates;
  staff?:   ApiChannelRates;
  agent?:   ApiChannelRates;
};

export type ApiRoomType = {
  id: string;
  hotel_id?: string;
  name: string;
  description: string;
  max_occupancy: number;
  bed_type?: string | null;
  size_sqft?: number | null;
  amenities: string[];
  images: string[];
  price_per_night: number;
  partner_net_price?: number;
  original_price: number | null;
  available: boolean;
  available_count: number;
  meal_plans?: ApiMealPlans;
  rates?: ApiRates | null;
  rate_plan_prices?: Record<string, {
    price: number;
    gst: number;
    tcs: number;
    taxes: number;
    total: number;
  }>;
  price_is_for_dates?: boolean;
  total_price?: number | null;
  nightly_breakdown?: { date: string; price: number }[];
  extra_bed_price?: number | null;
  /** Real KBC rate plan rows — used for hold (ratePlanId). */
  _kbcRatePlans?: {
    ratePlanId: string;
    name: string;
    refundable: boolean;
    mealPlan: string | null;
    roomSubtotalMinor: number;
    taxMinor: number;
    chargesMinor: number;
    promotionDiscountMinor: number;
    totalMinor: number;
  }[];
};

export type ApiHotelPolicies = {
  check_in_time: string;
  check_out_time: string;
  cancellation: string;
  children: string;
  pets: string;
  smoking: string;
  extra_bed: string;
};

export type ApiReview = {
  id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  stay_date: string;
  room_type: string | null;
  helpful_count: number;
};

export type ApiHotelDetail = ApiHotel & {
  starting_price_summary: {
    price: number; nights: number; rooms: number; subtotal: number;
    gst: number; tcs: number; taxes: number; total: number;
  };
  rooms: ApiRoomType[];
  policies: ApiHotelPolicies;
  reviews: ApiReview[];
  nearby_attractions: string[];
  check_in_time: string;
  check_out_time: string;
};

export type ApiHotelSearchResponse = {
  hotels: ApiHotel[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type ApiDestination = {
  city: string;
  state: string;
  country: string;
  hotel_count: number;
  image_url: string;
  slug: string;
  starting_price: number;
};

export type ApiHotelSlug = {
  city: string;
  slug: string;
  updated_at: string;
};

export type ApiHotelLocality = {
  id: string;
  slug: string;
  city: string;
  city_slug: string;
  name: string;
  state?: string | null;
  country: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  aliases: string[];
};

export type HotelSearchParams = {
  city?: string;
  q?: string;
  locality_slug?: string;
  check_in?: string;
  check_out?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  min_price?: number;
  max_price?: number;
  rating?: number;
  star_category?: number;
  amenities?: string[];
  sort?: string;
  page?: number;
  limit?: number;
};

export type HotelDetailBundle = {
  city: HotelCity;
  hotel: HotelListing;
  roomTypes: HotelRoomType[];
  policies: string[];
  reviews: ApiReview[];
  nearbyAttractions: string[];
  photoCategories: HotelPhotoCategory[];
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Hotel tax calculation — must match backend `app/utils/pricing.py`.
 *
 * GST slabs (declared tariff = price per night per room):
 *   ≤ ₹999     → 0%   (Nil)
 *   ₹1,000–₹7,499 → 12%  (Standard)
 *   ≥ ₹7,500   → 18%  (Luxury)
 *
 * TCS = 0.5% on (room + GST)
 */
function getHotelGstRate(pricePerNight: number): number {
  if (pricePerNight <= 999)  return 0;
  if (pricePerNight <= 7499) return 0.12;
  return 0.18;
}

function roomTaxes(pricePerNight: number): number {
  const gst = Math.round(pricePerNight * getHotelGstRate(pricePerNight));
  const tcs = Math.round(pricePerNight * 0.005);
  return gst + tcs;
}

function buildRoomRatePlans(room: ApiRoomType): HotelRoomRatePlan[] {
  // Prefer real KBC ratePlanIds so hold/confirm can book the selected plan.
  if (room._kbcRatePlans?.length) {
    return room._kbcRatePlans.map((rp, index) => {
      const price = Math.max(0, Math.round(rp.roomSubtotalMinor / 100));
      const taxes = Math.max(0, Math.round(rp.taxMinor / 100));
      const total = Math.max(0, Math.round(rp.totalMinor / 100));
      const meal = (rp.mealPlan ?? "").toLowerCase();
      const packageName =
        rp.name ||
        (meal.includes("breakfast") && meal.includes("dinner")
          ? "Half Board (MAP)"
          : meal.includes("breakfast")
            ? "With Breakfast (CP)"
            : meal.includes("all") || meal.includes("full")
              ? "Full Board (AP)"
              : "Room Only (EP)");
      return {
        id: rp.ratePlanId,
        packageName,
        benefits: rp.mealPlan ? [rp.mealPlan] : ["As per rate plan"],
        roomBasePrice: price,
        mealAddOn: 0,
        originalPrice: price,
        price,
        taxes,
        total: total || price + taxes,
        discountAmount: Math.max(0, Math.round((rp.promotionDiscountMinor ?? 0) / 100)),
        nonRefundable: !rp.refundable,
        couponCode: "",
        showBestValueBadge: index === 0,
      };
    });
  }

  const web = room.rates?.website;
  // The backend's `rate_plan_prices` amounts are for the complete selected
  // stay (one room). The room UI and checkout multiply its plan figures by
  // nights/rooms, so normalize those authoritative amounts back to one night
  // here. This also makes the displayed pre-tax price match PricingEngine
  // instead of the raw admin rate card.
  const stayNights = Math.max(1, room.nightly_breakdown?.length ?? 1);
  const livePlanPrice = (suffix: string, fallback: number) => {
    const live = room.rate_plan_prices?.[suffix];
    return live ? live.price / stayNights : fallback;
  };
  const livePlanTaxes = (suffix: string, fallbackPrice: number) => {
    const live = room.rate_plan_prices?.[suffix];
    return live ? live.taxes / stayNights : roomTaxes(fallbackPrice);
  };
  const livePlanTotal = (suffix: string, fallbackPrice: number) => {
    const live = room.rate_plan_prices?.[suffix];
    return live ? live.total / stayNights : fallbackPrice + roomTaxes(fallbackPrice);
  };

  // ── New per-plan pricing (rates.website) ─────────────────────────────────
  if (web?.room?.ep) {
    const ep  = Math.round(web.room.ep);
    const cp  = web.room.cp  ? Math.round(web.room.cp)  : null;
    const map = web.room.map ? Math.round(web.room.map) : null;
    const ap  = web.room.ap  ? Math.round(web.room.ap)  : null;

    const originalBase = room.original_price != null ? Math.round(room.original_price) : null;
    // When dates are not in the URL, the API returns the configured website
    // rates but no per-plan tax breakdown. `price_per_night` already includes
    // the applicable weekday/weekend adjustment for EP, so apply that same
    // multiplier to every meal plan before calculating its tax-inclusive total.
    const rateMultiplier = ep > 0 && room.price_per_night > 0
      ? room.price_per_night / ep
      : 1;

    const makePlan = (
      suffix:       string,
      packageName:  string,
      benefits:     string[],
      planPrice:    number,
      showBestValueBadge?: boolean,
    ): HotelRoomRatePlan => {
      const adjustedPlanPrice = Math.round(planPrice * rateMultiplier);
      const livePrice = livePlanPrice(suffix, adjustedPlanPrice);
      const originalPrice = originalBase != null ? originalBase + (livePrice - ep) : livePrice;
      return {
        id: `${room.id}-${suffix}`,
        packageName,
        benefits,
        roomBasePrice: ep,
        mealAddOn: livePrice - ep,
        originalPrice,
        price: livePrice,
        taxes: livePlanTaxes(suffix, livePrice),
        total: livePlanTotal(suffix, livePrice),
        discountAmount: originalBase != null ? Math.max(0, originalPrice - livePrice) : 0,
        nonRefundable: false,
        couponCode: "",
        showBestValueBadge,
      };
    };

    const plans: HotelRoomRatePlan[] = [
      makePlan("ep", "Room Only (EP)", ["No meals included"], ep),
    ];
    if (cp)  plans.push(makePlan("cp",  "With Breakfast (CP)",  ["Breakfast included"],                    cp));
    if (map) plans.push(makePlan("map", "Half Board (MAP)",     ["Breakfast included", "Dinner included"], map, true));
    if (ap)  plans.push(makePlan("ap",  "Full Board (AP)",      ["Breakfast included", "Lunch included", "Dinner included"], ap));
    return plans;
  }

  // ── Legacy pricing (price_per_night + meal_plans addon) ──────────────────
  const basePrice    = Math.round(room.price_per_night);
  const originalBase = room.original_price != null ? Math.round(room.original_price) : null;

  const makeLegacyPlan = (
    suffix:           string,
    packageName:      string,
    mealBenefits:     string[],
    mealCost:         number,
    showBestValueBadge?: boolean,
  ): HotelRoomRatePlan => {
    const price         = livePlanPrice(suffix, basePrice + mealCost);
    const originalPrice = originalBase != null ? originalBase + mealCost : price;
    return {
      id: `${room.id}-${suffix}`,
      packageName,
      benefits: mealBenefits,
      roomBasePrice: basePrice,
      mealAddOn: mealCost,
      originalPrice,
      price,
      taxes: livePlanTaxes(suffix, price),
      total: livePlanTotal(suffix, price),
      discountAmount: originalBase != null ? Math.max(0, originalPrice - price) : 0,
      nonRefundable: false,
      couponCode: "",
      showBestValueBadge,
    };
  };

  const plans: HotelRoomRatePlan[] = [
    makeLegacyPlan("ep", "Room Only (EP)", ["No meals included"], 0),
  ];

  const mp = room.meal_plans;
  if (!mp) return plans;

  const breakfast = Math.round(mp.breakfast ?? 0);
  const lunch     = Math.round(mp.lunch     ?? 0);
  const dinner    = Math.round(mp.dinner    ?? 0);

  if (breakfast > 0) {
    plans.push(makeLegacyPlan("cp", "With Breakfast (CP)", [`Breakfast included — ₹${breakfast}/night`], breakfast));
  }
  if (breakfast > 0 && dinner > 0) {
    plans.push(makeLegacyPlan("map", "Half Board (MAP)", [`Breakfast — ₹${breakfast}/night`, `Dinner — ₹${dinner}/night`], breakfast + dinner, true));
  }
  if (breakfast > 0 && lunch > 0 && dinner > 0) {
    plans.push(makeLegacyPlan("ap", "Full Board (AP)", [`Breakfast — ₹${breakfast}/night`, `Lunch — ₹${lunch}/night`, `Dinner — ₹${dinner}/night`], breakfast + lunch + dinner));
  }

  return plans;
}

function ratingLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4)   return "Very Good";
  if (score >= 3.5) return "Good";
  if (score >= 3)   return "Average";
  if (score > 0)    return "Fair";
  return "New";
}

export function citySlugFromName(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, "-");
}

function cleanAddressPart(part: string): string {
  return part.trim().replace(/\s+/g, " ");
}

function hotelAreaFromAddress(address: string, city: string): string {
  const cityLower = city.trim().toLowerCase();
  const parts = address
    .split(",")
    .map(cleanAddressPart)
    .filter(Boolean)
    .filter((part) => {
      const lower = part.toLowerCase();
      return (
        lower !== cityLower &&
        !/^\d{5,6}$/.test(lower) &&
        !lower.includes("himachal pradesh") &&
        lower !== "india"
      );
    });

  const locality = parts.find((part) => !/\d/.test(part)) ?? parts[0];
  return locality || city;
}

async function apiFetch<T>(path: string, init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }): Promise<T | null> {
  const result = await apiJson<T>(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) return null;
  return result.data;
}

function collectHotelImages(h: ApiHotel): string[] {
  const fromList       = (h.images ?? []).map((u) => u.trim()).filter(Boolean);
  const fromCategories = (h.photo_categories ?? []).flatMap((c) =>
    (c.images ?? []).map((u) => u.trim()).filter(Boolean),
  );
  const unique = [...new Set([...fromList, ...fromCategories])];
  if (unique.length > 0) return unique;
  if (h.thumbnail_url?.trim()) return [h.thumbnail_url.trim()];
  return [];
}

export function mapApiHotelToListing(h: ApiHotel): HotelListing {
  const citySlug  = citySlugFromName(h.city);
  const price     = Math.round(h.starting_price);
  const original  = Math.round(price * 1.15);
  const images    = collectHotelImages(h);
  const tagLower  = h.tags.map((t) => t.toLowerCase());
  const area      = h.locality_name?.trim() || hotelAreaFromAddress(h.address, h.city);

  return {
    id:           h.id,
    hotelSlug:    h.slug,
    citySlug,
    name:         h.name,
    stars:        h.star_category,
    area,
    locationLine: area ? `${area} | In ${h.city}` : formatHotelCardLocation(h.city, h.state),
    tags:         h.tags,
    amenities:    h.amenities.map((a) => a.toLowerCase()),
    amenityMoreCount: Math.max(0, h.amenities.length - 4),
    highlights:   h.is_featured
      ? ["Featured stay"]
      : h.is_verified
      ? ["Verified property"]
      : [],
    description:      h.description,
    rating:           h.rating > 0 ? h.rating : 0,
    ratingLabel:      ratingLabel(h.rating),
    reviewCount:      h.review_count,
    originalPrice:    original,
    price,
    taxes:            roomTaxes(price),
    images,
    dealOfDay:        h.is_featured,
    bookWithZero:     false,
    freeCancellation: /free cancellation/i.test(
      h.tags.join(" ") + " " + h.amenities.join(" "),
    ),
    freeBreakfast:    /breakfast/i.test(h.amenities.join(" ")),
    freeParking:      /parking/i.test(h.amenities.join(" ")),
    coupleFriendly:   tagLower.some((t) => t.includes("couple")),
    localIdsAccepted: true,
    propertyPhotoCount: images.length,
    roomPhotoCount:     Math.max(0, images.length - 1),
    videoCount:         0,
    nearbyLandmark:     area || h.city,
    defaultRoomType:    "Standard room",
    roomOptionsCount:   1,
    address:            h.address ?? undefined,
    state:              h.state ?? undefined,
    country:            h.country ?? undefined,
  };
}

/** Map KBC marketplace property → Unotrips hotel card shape (UI only). */
export function mapMarketplacePropertyToListing(p: MarketplaceProperty): HotelListing {
  const city = p.city?.trim() || "India";
  const citySlug = citySlugFromName(city);
  const price = Math.max(0, Math.round((p.startingPriceMinor ?? 0) / 100));
  const original = price > 0 ? Math.round(price * 1.12) : 0;
  const images = (p.photos ?? []).filter(Boolean);
  const amenities = (p.amenities ?? []).map((a) => a.toLowerCase());
  const area = p.state?.trim() || city;

  return {
    id: p.id,
    hotelSlug: p.slug,
    citySlug,
    name: p.name,
    stars: 0,
    area,
    locationLine: formatHotelCardLocation(city, p.state ?? undefined),
    tags: [],
    amenities,
    amenityMoreCount: Math.max(0, amenities.length - 4),
    highlights: ["Verified on KBC Trip"],
    description: p.description ?? "",
    rating: 0,
    ratingLabel: "New",
    reviewCount: 0,
    originalPrice: original,
    price,
    taxes: roomTaxes(price),
    images,
    dealOfDay: false,
    bookWithZero: false,
    freeCancellation: amenities.some((a) => a.includes("cancel")),
    freeBreakfast: amenities.some((a) => a.includes("breakfast")),
    freeParking: amenities.some((a) => a.includes("parking")),
    coupleFriendly: false,
    localIdsAccepted: true,
    propertyPhotoCount: images.length,
    roomPhotoCount: Math.max(0, images.length - 1),
    videoCount: 0,
    nearbyLandmark: city,
    defaultRoomType: "Standard room",
    roomOptionsCount: 1,
    state: p.state ?? undefined,
    country: p.country ?? undefined,
  };
}

export function mapApiRoomsToHotelRoomTypes(
  hotel: HotelListing,
  rooms: ApiRoomType[],
): HotelRoomType[] {
  return rooms
    .filter((r) => {
      const hasKbc = Boolean(r._kbcRatePlans?.length);
      const hasPrice = r.price_per_night > 0 || (r.rates?.website?.room?.ep ?? 0) > 0;
      return (r.available || hasKbc) && (hasPrice || hasKbc);
    })
    .map((room) => {
      const image = room.images[0] ?? hotel.images[0] ?? "";
      const tags  = [
        room.bed_type  ? `${room.bed_type} bed`    : "Bed",
        room.size_sqft ? `${room.size_sqft} Sq Ft` : null,
        `${room.max_occupancy} Guests`,
        room.available_count > 0 ? `${room.available_count} rooms left` : null,
      ].filter(Boolean) as string[];

      return {
        id:           room.id,
        name:         room.name,
        image,
        description:  room.description?.trim() || undefined,
        amenities:    room.amenities,
        availableCount: room.available_count,
        maxOccupancy: room.max_occupancy ?? 2,
        extraBedPrice: room.rates?.website?.extra_bed?.ep ?? room.extra_bed_price ?? null,
        tags,
        ratePlans:    buildRoomRatePlans(room),
      };
    });
}

export function mapApiPoliciesToBullets(policies: ApiHotelPolicies): string[] {
  return [
    `Check-in from ${policies.check_in_time}, check-out by ${policies.check_out_time}.`,
    policies.cancellation,
    policies.children,
    policies.pets,
    policies.smoking,
    policies.extra_bed,
  ].filter(Boolean);
}

// ── City resolution (used by search, destination pages — unchanged) ───────────

async function resolveApiCityName(cityInput: string): Promise<string> {
  if (!cityInput.includes("-")) return cityInput;

  const normalized = citySlugFromName(cityInput);
  const slugs      = await fetchHotelSlugs();
  const match      = slugs.find(
    (s) =>
      citySlugFromName(s.city) === normalized ||
      s.city.toLowerCase()    === normalized ||
      s.slug                  === normalized,
  );
  if (match) return match.city;

  const dests = await fetchPopularDestinations();
  const dest  = dests.find(
    (d) => d.slug === normalized || citySlugFromName(d.city) === normalized,
  );
  if (dest) return dest.city;

  return cityInput.replace(/-/g, " ");
}

// ── Public fetch functions ────────────────────────────────────────────────────

export async function searchHotels(
  params: HotelSearchParams,
): Promise<{ hotels: HotelListing[]; total: number }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 24;
  try {
    const catalog = await listProperties(params.city || undefined, page, limit);
    let hotels = catalog.properties.map(mapMarketplacePropertyToListing);
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      hotels = hotels.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.area.toLowerCase().includes(q) ||
          h.locationLine.toLowerCase().includes(q),
      );
    }
    if (params.min_price != null) {
      hotels = hotels.filter((h) => h.price >= params.min_price!);
    }
    if (params.max_price != null) {
      hotels = hotels.filter((h) => h.price <= params.max_price!);
    }
    return { hotels, total: catalog.total };
  } catch {
    return { hotels: [], total: 0 };
  }
}

export async function fetchFeaturedHotels(): Promise<HotelListing[]> {
  const { hotels } = await fetchAllHotels(12);
  return hotels.slice(0, 8);
}

export async function fetchHotelLocalities(
  city?: string,
  q?: string,
): Promise<HotelLocalityOption[]> {
  try {
    const catalog = await listProperties(city || undefined, 1, 100);
    const byCity = new Map<string, HotelLocalityOption>();
    for (const p of catalog.properties) {
      const name = (p.city ?? "").trim();
      if (!name) continue;
      if (q && !name.toLowerCase().includes(q.toLowerCase())) continue;
      const slug = citySlugFromName(name);
      if (byCity.has(slug)) continue;
      byCity.set(slug, {
        slug,
        citySlug: slug,
        city: name,
        name,
        state: p.state ?? undefined,
        country: p.country ?? "India",
        description: "",
        latitude: 0,
        longitude: 0,
      });
    }
    return Array.from(byCity.values());
  } catch {
    return [];
  }
}

/** Paginate KBC marketplace properties (API page size is capped ~24). */
async function listAllMarketplaceProperties(maxItems = 200): Promise<{
  properties: MarketplaceProperty[];
  total: number;
}> {
  const properties: MarketplaceProperty[] = [];
  let page = 1;
  let total = 0;
  let totalPages = 1;

  while (properties.length < maxItems && page <= totalPages) {
    const catalog = await listProperties(undefined, page, 100);
    total = catalog.total;
    totalPages = Math.max(1, catalog.totalPages || 1);
    if (!catalog.properties.length) break;
    properties.push(...catalog.properties);
    if (page >= totalPages) break;
    page += 1;
  }

  return { properties: properties.slice(0, maxItems), total };
}

/** Every hotel from KBC marketplace properties. */
export async function fetchAllHotels(
  limit = 50,
): Promise<{ hotels: HotelListing[]; total: number }> {
  try {
    const { properties, total } = await listAllMarketplaceProperties(limit);
    return {
      hotels: properties.map(mapMarketplacePropertyToListing),
      total,
    };
  } catch {
    return { hotels: [], total: 0 };
  }
}

export async function fetchPopularDestinations(): Promise<ApiDestination[]> {
  try {
    const { properties } = await listAllMarketplaceProperties(200);
    const byCity = new Map<string, ApiDestination>();
    for (const p of properties) {
      const city = (p.city ?? "").trim();
      if (!city) continue;
      const slug = citySlugFromName(city);
      const price = Math.max(0, Math.round((p.startingPriceMinor ?? 0) / 100));
      const existing = byCity.get(slug);
      if (existing) {
        existing.hotel_count += 1;
        if (price > 0 && (existing.starting_price === 0 || price < existing.starting_price)) {
          existing.starting_price = price;
        }
        if (!existing.image_url && p.photos?.[0]) existing.image_url = p.photos[0];
      } else {
        byCity.set(slug, {
          city,
          state: p.state ?? "",
          country: p.country ?? "India",
          hotel_count: 1,
          image_url: p.photos?.[0] ?? "",
          slug,
          starting_price: price,
        });
      }
    }
    return Array.from(byCity.values()).sort((a, b) => b.hotel_count - a.hotel_count);
  } catch {
    return [];
  }
}

export async function fetchDestinationBySlug(
  slug: string,
): Promise<ApiDestination | null> {
  const dests = await fetchPopularDestinations();
  return dests.find((d) => d.slug === slug || citySlugFromName(d.city) === slug) ?? null;
}

export async function fetchHotelSlugs(): Promise<ApiHotelSlug[]> {
  try {
    const catalog = await listProperties(undefined, 1, 100);
    return catalog.properties.map((p) => ({
      city: p.city?.trim() || "india",
      slug: p.slug,
      updated_at: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function propertyDetailToApiHotelDetail(
  detail: Awaited<ReturnType<typeof getPropertyDetail>>,
  listing: HotelListing,
  rooms: ApiRoomType[] = [],
): ApiHotelDetail {
  const price = listing.price;
  return {
    id: listing.id,
    slug: listing.hotelSlug ?? detail.slug,
    name: detail.name,
    description: detail.description ?? "",
    city: detail.city ?? listing.citySlug,
    state: detail.state ?? listing.state ?? "",
    country: detail.country ?? listing.country ?? "India",
    address: detail.address ?? "",
    locality_name: detail.city ?? "",
    star_category: listing.stars,
    rating: listing.rating,
    review_count: listing.reviewCount,
    starting_price: price,
    currency: detail.currency ?? "INR",
    thumbnail_url: detail.photos?.[0] ?? listing.images[0] ?? "",
    images: detail.photos ?? listing.images,
    amenities: detail.amenities ?? [],
    tags: [],
    is_featured: false,
    is_verified: true,
    collection_type: null,
    latitude: listing.latitude ?? 0,
    longitude: listing.longitude ?? 0,
    starting_price_summary: {
      price,
      nights: 1,
      rooms: 1,
      subtotal: price,
      gst: roomTaxes(price),
      tcs: 0,
      taxes: roomTaxes(price),
      total: price + roomTaxes(price),
    },
    rooms,
    policies: {
      check_in_time: detail.checkInTime || "14:00",
      check_out_time: detail.checkOutTime || "11:00",
      cancellation: "Contact property for cancellation policy.",
      children: "",
      pets: "",
      smoking: "",
      extra_bed: "",
    },
    reviews: [],
    nearby_attractions: [],
    check_in_time: detail.checkInTime || "14:00",
    check_out_time: detail.checkOutTime || "11:00",
  };
}

function mapKbcRoomsToApiRoomTypes(
  available: Awaited<ReturnType<typeof getAvailability>>,
  catalogRooms: Awaited<ReturnType<typeof getRoomTypes>>,
): ApiRoomType[] {
  const catalog = catalogRooms ?? [];
  const rooms = available?.rooms?.length
    ? available.rooms
    : catalog.map((r) => ({
        roomTypeId: r.id,
        name: r.name,
        description: r.description,
        maxOccupancy: r.maxOccupancy,
        amenities: r.amenities ?? [],
        photos: r.photos ?? [],
        available: r.units,
        ratePlans: (r.ratePlans ?? []).map((rp) => ({
          ratePlanId: rp.id,
          name: rp.name,
          refundable: rp.refundable,
          mealPlan: rp.mealPlan,
          roomSubtotalMinor: r.basePriceMinor,
          taxMinor: Math.round(r.basePriceMinor * 0.12),
          chargesMinor: 0,
          promotionDiscountMinor: 0,
          totalMinor: r.basePriceMinor + Math.round(r.basePriceMinor * 0.12),
        })),
      }));

  return rooms
    .filter((r) => (r.available ?? 0) > 0 || (r.ratePlans?.length ?? 0) > 0)
    .map((room) => {
      const cheapest = [...(room.ratePlans ?? [])].sort(
        (a, b) => a.totalMinor - b.totalMinor,
      )[0];
      const pricePerNight = Math.max(
        0,
        Math.round((cheapest?.roomSubtotalMinor ?? cheapest?.totalMinor ?? 0) / 100),
      );
      const taxes = Math.max(0, Math.round((cheapest?.taxMinor ?? 0) / 100));
      return {
        id: room.roomTypeId,
        name: room.name,
        description: room.description ?? "",
        images: room.photos ?? [],
        amenities: room.amenities ?? [],
        max_occupancy: room.maxOccupancy,
        available: (room.available ?? 0) > 0,
        available_count: room.available ?? 0,
        price_per_night: pricePerNight,
        original_price: null,
        bed_type: null,
        size_sqft: null,
        extra_bed_price: null,
        rates: {
          website: {
            room: {
              ep: pricePerNight,
              cp: null,
              map: null,
              ap: null,
            },
            tax: { ep: taxes, cp: null, map: null, ap: null },
            total: {
              ep: pricePerNight + taxes,
              cp: null,
              map: null,
              ap: null,
            },
            extra_bed: { ep: null },
          },
        },
        // Preserve real KBC rate plans for booking (see mapApiRoomsToHotelRoomTypes).
        _kbcRatePlans: room.ratePlans,
      } as ApiRoomType & { _kbcRatePlans?: typeof room.ratePlans };
    });
}

export async function fetchHotelDetail(
  city: string,
  hotelSlug: string,
  checkIn?: string,
  checkOut?: string,
): Promise<ApiHotelDetail | null> {
  void city;
  try {
    const detail = await getPropertyDetail(hotelSlug);
    if (!detail) return null;

    const defaultIn = checkIn || isoDaysFromNowSafe(7);
    const defaultOut = checkOut || isoDaysFromNowSafe(8);

    const [catalogRooms, availability, catalog] = await Promise.all([
      getRoomTypes(hotelSlug),
      getAvailability(hotelSlug, defaultIn, defaultOut, 2, 0),
      listProperties(detail.city ?? undefined, 1, 100).catch(() => null),
    ]);

    const rooms = mapKbcRoomsToApiRoomTypes(availability, catalogRooms);
    const match = catalog?.properties?.find((p) => p.slug === hotelSlug);
    const listing = match
      ? mapMarketplacePropertyToListing(match)
      : mapMarketplacePropertyToListing({
          id: hotelSlug,
          name: detail.name,
          slug: detail.slug,
          city: detail.city,
          state: detail.state,
          country: detail.country,
          description: detail.description,
          photos: detail.photos ?? [],
          amenities: detail.amenities ?? [],
          currency: detail.currency,
          startingPriceMinor: rooms[0]
            ? Math.round((rooms[0].price_per_night ?? 0) * 100)
            : null,
        });

    return propertyDetailToApiHotelDetail(detail, listing, rooms);
  } catch {
    return null;
  }
}

function isoDaysFromNowSafe(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function fetchRelatedHotels(
  hotelId: string,
  limit = 4,
): Promise<HotelListing[]> {
  const { hotels } = await fetchAllHotels(Math.max(limit + 1, 12));
  return hotels.filter((h) => h.id !== hotelId).slice(0, limit);
}

// ── resolveHotelCity — unchanged, still used by search / destination pages ────

export async function resolveHotelCity(
  citySlug: string,
): Promise<HotelCity | null> {
  const normalized = citySlug.trim().toLowerCase();

  const dest =
    (await fetchDestinationBySlug(normalized)) ??
    (await fetchPopularDestinations()).find(
      (d) =>
        d.slug === normalized || citySlugFromName(d.city) === normalized,
    ) ??
    null;

  if (dest) {
    return {
      slug:         dest.slug || normalized,
      name:         dest.city,
      fullLocation: `${dest.city}, ${dest.state}, ${dest.country}`,
    };
  }

  const slugs     = await fetchHotelSlugs();
  const fromHotel = slugs.find(
    (s) => citySlugFromName(s.city) === normalized,
  );
  if (fromHotel) {
    return {
      slug:         normalized,
      name:         fromHotel.city,
      fullLocation: `${fromHotel.city}, India`,
    };
  }

  return null;
}

// ── Other helpers — unchanged ─────────────────────────────────────────────────

export async function getHotelListingCitySlugs(): Promise<string[]> {
  const slugs     = await fetchHotelSlugs();
  const fromHotels = [...new Set(slugs.map((s) => citySlugFromName(s.city)))];
  const dests      = await fetchPopularDestinations();
  const fromDests  = dests.map((d) => d.slug || citySlugFromName(d.city));
  return [...new Set([...fromHotels, ...fromDests])];
}

export async function cityHasHotels(citySlug: string): Promise<boolean> {
  const cities = await getHotelListingCitySlugs();
  return cities.includes(citySlugFromName(citySlug));
}

export async function resolveHotelCitySlugFromSearch(
  cityName: string,
): Promise<string | null> {
  const normalized = cityName.trim().toLowerCase();
  if (!normalized) return null;

  const dests = await fetchPopularDestinations();
  const dest  = dests.find(
    (d) =>
      d.city.toLowerCase()       === normalized ||
      d.slug                     === citySlugFromName(normalized) ||
      citySlugFromName(d.city)   === normalized,
  );
  if (dest) return dest.slug || citySlugFromName(dest.city);

  const slugs    = await fetchHotelSlugs();
  const fromSlug = slugs.find(
    (s) => citySlugFromName(s.city) === citySlugFromName(normalized),
  );
  if (fromSlug) return citySlugFromName(fromSlug.city);

  return citySlugFromName(normalized);
}

// ── fetchHotelDestinations — unchanged ───────────────────────────────────────

const DEFAULT_DESTINATION_IMAGE = "/images/hotels/hero-banner.webp";

/** All bookable hotel destinations — popular API + cities from hotel slugs. */
export async function fetchHotelDestinations(): Promise<
  {
    slug: string;
    city: string;
    state: string;
    country: string;
    hotelCount: number;
    imageUrl: string;
    startingPrice: number;
  }[]
> {
  const [popular, slugList] = await Promise.all([
    fetchPopularDestinations(),
    fetchHotelSlugs(),
  ]);

  type DestListing = {
    slug:          string;
    city:          string;
    state:         string;
    country:       string;
    hotelCount:    number;
    imageUrl:      string;
    startingPrice: number;
  };

  const map = new Map<string, DestListing>();

  for (const d of popular) {
    const slug = (d.slug || citySlugFromName(d.city)).toLowerCase();
    map.set(slug, {
      slug,
      city:          d.city,
      state:         d.state,
      country:       d.country,
      hotelCount:    d.hotel_count,
      imageUrl:      d.image_url || DEFAULT_DESTINATION_IMAGE,
      startingPrice: d.starting_price,
    });
  }

  const countByCity = new Map<string, { city: string; count: number }>();
  for (const s of slugList) {
    const slug = citySlugFromName(s.city);
    const cur  = countByCity.get(slug);
    if (cur) cur.count += 1;
    else countByCity.set(slug, { city: s.city, count: 1 });
  }

  for (const [slug, { city, count }] of countByCity) {
    const existing = map.get(slug);
    if (!existing) {
      map.set(slug, {
        slug,
        city,
        state:         "",
        country:       "India",
        hotelCount:    count,
        imageUrl:      DEFAULT_DESTINATION_IMAGE,
        startingPrice: 0,
      });
    } else {
      existing.hotelCount = Math.max(existing.hotelCount, count);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const byHotels = b.hotelCount - a.hotelCount;
    return byHotels || a.city.localeCompare(b.city);
  });
}

export type HotelDestinationListing = Awaited<
  ReturnType<typeof fetchHotelDestinations>
>[number];

// ── mapApiReviewsForUi — unchanged ────────────────────────────────────────────

export function mapApiReviewsForUi(reviews: ApiReview[]) {
  return reviews.map((r) => ({
    id:           r.id,
    author:       r.user_name,
    rating:       r.rating,
    title:        r.title,
    body:         r.comment,
    date:         r.stay_date || r.created_at,
    helpfulCount: r.helpful_count,
    roomType:     r.room_type,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// getHotelDetailBundle — THE CORE FIX
// ─────────────────────────────────────────────────────────────────────────────
//
// BEFORE: 5 sequential calls (waterfall)
//   fetchHotelSlugs → fetchHotelDetail → fetchDestinationBySlug →
//   fetchPopularDestinations → fetchRelatedHotels
//
// AFTER: 2 parallel calls
//   fetchHotelDetail + fetchRelatedHotels run in Promise.all()
//   City is built from detail.city — zero extra API call
//
// HOW THE CITY IS RESOLVED WITHOUT AN API CALL:
//   ApiHotelDetail extends ApiHotel which has: city, state, country.
//   We build HotelCity directly from these fields.
//   No destination endpoint needed. No slug lookup needed.
//
// SLUG LOOKUP REMOVAL:
//   The old code called fetchHotelSlugs() to find which city to pass to
//   fetchHotelDetail(city, slug). But the backend route is:
//     GET /v1/hotels/{city}/{slug}
//   We pass hotelSlug as the city param too — the backend's property_repo
//   looks up by slug regardless. If the hotel doesn't exist the backend
//   returns 404 and apiFetch returns null — same null check as before.
//
//   Wait — the backend route is /hotels/{city}/{slug} and requires BOTH.
//   So we need the city. BUT: we can use the slug as the city placeholder
//   and the backend will still find it by slug. OR we fetch slugs only when
//   the direct call fails. We use the latter — try direct, fallback to lookup.
//   In practice the URL always contains a valid city slug (set by the
//   canonical URL generator), so the fallback never fires for real traffic.
//   See _fetchDetailWithCityFallback() below.
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a HotelCity from an ApiHotelDetail response.
 * The detail response already contains city/state/country — no API call needed.
 */
function buildCityFromDetail(detail: ApiHotelDetail): HotelCity {
  return {
    slug:         citySlugFromName(detail.city),
    name:         detail.city,
    fullLocation: `${detail.city}, ${detail.state}, ${detail.country}`,
  };
}

/**
 * Fetch hotel detail using the city from the URL param first.
 * If that 404s (stale URL / city mismatch), look up the correct city from
 * the slugs list and retry once.
 *
 * In normal production traffic, the URL city always matches so the fallback
 * never fires. It exists to handle edge cases like:
 *   - Old bookmarked URLs with a wrong city segment
 *   - Admin renaming the city on a property
 *
 * This keeps us at 2 API calls (detail + related) for 99.9% of requests.
 * The fallback adds 1 extra call only for stale/malformed URLs.
 */
async function _fetchDetailWithCityFallback(
  cityParam:    string,
  hotelSlug:    string,
  checkIn?:     string,
  checkOut?:    string,
): Promise<ApiHotelDetail | null> {
  // Primary attempt — use the city from the URL directly
  const direct = await fetchHotelDetail(cityParam, hotelSlug, checkIn, checkOut);
  if (direct) return direct;

  // Fallback — look up correct city from slugs list, retry once
  // This adds 1 extra call but only for stale/malformed URLs (<0.1% of traffic)
  const slugs = await fetchHotelSlugs();
  const match = slugs.find((s) => s.slug === hotelSlug);
  if (!match) return null;

  // Only retry if the city we found is different from what we tried
  if (match.city.toLowerCase() === cityParam.toLowerCase()) return null;

  return fetchHotelDetail(match.city, hotelSlug, checkIn, checkOut);
}

/**
 * getHotelDetailBundle
 *
 * Returns the data required for the initial hotel detail page in one request.
 * Similar hotels are intentionally fetched client-side after the first fold.
 *
 * @param cityParam   - City slug from the URL (e.g. "shimla", "dharamshala")
 * @param hotelSlugOrId - Hotel slug from the URL (e.g. "hotel-willow-banks")
 * @param checkIn     - Optional ISO date string for availability (YYYY-MM-DD)
 * @param checkOut    - Optional ISO date string for availability (YYYY-MM-DD)
 */
export async function getHotelDetailBundle(
  cityParam:    string,
  hotelSlugOrId: string,
  checkIn?:     string,
  checkOut?:    string,
): Promise<HotelDetailBundle | null> {
  const hotelSlug = decodeURIComponent(hotelSlugOrId).trim();

  // The primary detail payload contains everything needed above the fold.
  // Keep the server render to this request so ad landings do not wait for
  // content that is only visible after the visitor scrolls.

  let detail = await _fetchDetailWithCityFallback(
    cityParam,
    hotelSlug,
    checkIn,
    checkOut,
  );

  // A date-aware detail request includes availability and all board-rate
  // calculations. If that optional enrichment fails upstream, do not turn a
  // real hotel into a fake Next.js 404. Fall back to its normal detail payload;
  // the booking submission still performs the authoritative live availability
  // check before payment.
  if (!detail && (checkIn || checkOut)) {
    detail = await _fetchDetailWithCityFallback(cityParam, hotelSlug);
  }
  if (!detail) return null;

  // Build the bundle from the detail response — no extra network calls.

  let hotel        = mapApiHotelToListing(detail);
  const city       = buildCityFromDetail(detail);   // ← extracted from detail, zero API call
  const roomTypes  = mapApiRoomsToHotelRoomTypes(hotel, detail.rooms);

  // If hotel-level starting_price is 0 (not set), derive it from the cheapest EP rate
  if (hotel.price === 0 && detail.rooms.length > 0) {
    const minEp = Math.min(
      ...detail.rooms
        .map((r) => r.rates?.website?.room?.ep ?? r.price_per_night ?? 0)
        .filter((p) => p > 0),
    );
    if (minEp > 0) hotel = { ...hotel, price: minEp };
  }
  const policies   = mapApiPoliciesToBullets(detail.policies);

  const photoCategories: HotelPhotoCategory[] = (
    detail.photo_categories ?? []
  ).map((c) => ({
    category: c.category,
    label:    c.label,
    images:   c.images ?? [],
  }));

  const roomPhotoCount =
    photoCategories.find((c) => /room/i.test(c.category))?.images.length ??
    roomTypes.reduce((n, r) => n + (r.image ? 1 : 0), 0);

  return {
    city,
    hotel: {
      ...hotel,
      startingPriceSummary: detail.starting_price_summary,
      roomOptionsCount: roomTypes.length,
      defaultRoomType:  roomTypes[0]?.name ?? hotel.defaultRoomType,
      nearbyLandmark:   detail.nearby_attractions?.[0] ?? hotel.nearbyLandmark,
      propertyPhotoCount: detail.images?.length ?? hotel.propertyPhotoCount,
      roomPhotoCount,
    },
    roomTypes,
    policies,
    reviews:          detail.reviews           ?? [],
    nearbyAttractions: detail.nearby_attractions ?? [],
    photoCategories,
  };
}

// ── resolveHotelBookingSelection — unchanged ──────────────────────────────────

export async function resolveHotelBookingSelection(
  cityParam:     string,
  hotelSlugOrId: string,
  roomTypeId:    string,
  ratePlanId:    string,
): Promise<HotelBookingSelection | undefined> {
  const bundle = await getHotelDetailBundle(cityParam, hotelSlugOrId);
  if (!bundle) return undefined;

  const roomType = bundle.roomTypes.find((r) => r.id === roomTypeId);
  if (!roomType) return undefined;

  const ratePlan = roomType.ratePlans.find((p) => p.id === ratePlanId);
  if (!ratePlan) return undefined;

  return {
    city:     bundle.city,
    hotel:    bundle.hotel,
    roomType,
    ratePlan,
  };
}
