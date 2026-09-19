/**
 * Build Unotrips-shaped day-options / customizer data from a KBC marketplace
 * holiday package — no Unotrips API.
 */

import type { TourItineraryDay, TourPackage } from "@/lib/constants";
import type {
  AddonOption,
  CabOption,
  DestinationHotels,
  HotelOption,
} from "@/lib/package-customizer-data";
import { cabOptionsFromTour, hotelGroupsFromTour } from "@/lib/uno-package-adapter";

/** Local day-options payload — kept here to avoid hook↔lib cycles. */
type DaySightseeing = {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  entry_fee: number;
  price_per_person: number;
  price_type: "per_person" | "per_group" | "included";
  is_included: boolean;
  is_optional: boolean;
  is_selected_by_default: boolean;
  seasonal_note: string | null;
};

type DayActivity = {
  id: string;
  link_id: string;
  name: string;
  short_description: string | null;
  category: string | null;
  difficulty_level: string;
  duration: string | null;
  age_limit: string | null;
  featured_image: string | null;
  tags: string[];
  price: number;
  price_type: "per_person" | "per_group" | "per_vehicle";
  original_price: number;
  has_override: boolean;
  is_optional: boolean;
  is_selected_by_default: boolean;
  seasonal_note: string | null;
  sort_order: number;
};

type DayOption = {
  day_number: number;
  title: string;
  location: string;
  day_image?: string | null;
  hotel_options?: Array<{
    id: string;
    name: string;
    stars: number;
    description: string;
    image_url: string | null;
    images?: string[];
    price_delta: number;
    is_default: boolean;
    is_popular: boolean;
    dest_name?: string;
    dest_nights?: number;
    room_type?: string;
    meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
  }>;
  sightseeing: DaySightseeing[];
  activities: DayActivity[];
};

export type KbcDayOptionsData = {
  package_id: string;
  base_price: number;
  token_type: string;
  token_amount: number;
  balance_due_days: number;
  is_customizable: boolean;
  days: DayOption[];
  stays?: Array<{
    id: string;
    destination_city: string;
    sort_order?: number;
    nights: number;
    is_active?: boolean;
    default_hotel_id?: string | null;
    default_hotel_name?: string | null;
    default_room_type_name?: string | null;
    default_meal_plan?: string | null;
    default_hotel_info?: {
      star_category?: number | null;
      thumbnail_url?: string | null;
      images?: string[];
      amenities?: string[];
      address?: string | null;
      description?: string | null;
      rating?: number | null;
      review_count?: number;
      check_in_time?: string | null;
      check_out_time?: string | null;
      hotel_slug?: string | null;
      room_count?: number;
    } | null;
    hotel_options?: Array<{
      id: string;
      hotel_id: string;
      hotel_name: string;
      default_room_type_name?: string | null;
      sort_order?: number;
      upgrade_price?: number | null;
      starting_price?: number | null;
      room_count?: number;
      image_url?: string | null;
      images?: string[];
      hotel_slug?: string | null;
      star_category?: number | null;
      thumbnail_url?: string | null;
      amenities?: string[];
      address?: string | null;
      city?: string | null;
      description?: string | null;
      rating?: number | null;
      review_count?: number;
      check_in_time?: string | null;
      check_out_time?: string | null;
    }>;
  }>;
  cabs: Array<{
    id: string;
    name: string;
    description: string | null;
    seats: number;
    image_url?: string | null;
    price_delta: number;
    upgrade_price?: number | null;
    is_default: boolean;
    is_popular: boolean;
    sort_order: number;
  }>;
  addons: Array<{
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    price_per_person: number;
    is_default_on: boolean;
  }>;
};

function dayLocation(day: TourItineraryDay, tour: TourPackage): string {
  return (
    day.location?.trim() ||
    day.stay?.trim() ||
    tour.location?.split(",")[0]?.trim() ||
    tour.title
  );
}

function mealsFlags(meals?: string): { breakfast: boolean; lunch: boolean; dinner: boolean } {
  const m = (meals ?? "").toLowerCase();
  return {
    breakfast: /breakfast|bb|cp|map|ap|ai/.test(m) || !m,
    lunch: /lunch|map|ap|ai/.test(m),
    dinner: /dinner|ap|ai/.test(m),
  };
}

function activitiesFromDay(day: TourItineraryDay, dayNumber: number): DayActivity[] {
  const labels = (day.activities ?? []).filter((a) => a?.trim());
  return labels.map((name, index) => ({
    id: `act-${dayNumber}-${index}`,
    link_id: `act-${dayNumber}-${index}`,
    name,
    short_description: null,
    category: "included",
    difficulty_level: "easy",
    duration: null,
    age_limit: null,
    featured_image: null,
    tags: ["included"],
    price: 0,
    price_type: "per_person" as const,
    original_price: 0,
    has_override: false,
    is_optional: false,
    is_selected_by_default: true,
    seasonal_note: null,
    sort_order: index,
  }));
}

function sightseeingFromDay(day: TourItineraryDay, dayNumber: number): DaySightseeing[] {
  const summary = (day.summary || day.body || "").trim();
  if (!summary && !(day.activities?.length)) return [];
  return [
    {
      id: `sight-${dayNumber}`,
      name: day.title || `Day ${dayNumber} highlights`,
      location: day.location ?? null,
      description: summary || (day.activities ?? []).join(" · ") || null,
      image_url: day.image ?? null,
      duration: null,
      entry_fee: 0,
      price_per_person: 0,
      price_type: "included",
      is_included: true,
      is_optional: false,
      is_selected_by_default: true,
      seasonal_note: null,
    },
  ];
}

function buildDays(tour: TourPackage): DayOption[] {
  const days = tour.itinerary ?? [];
  if (!days.length) {
    const n = Math.max(tour.durationDays || tour.durationNights + 1, 1);
    return Array.from({ length: n }, (_, i) => {
      const dayNumber = i + 1;
      return {
        day_number: dayNumber,
        title: `Day ${dayNumber}`,
        location: tour.location?.split(",")[0]?.trim() || tour.title,
        day_image: tour.galleryImages?.[i % (tour.galleryImages?.length || 1)] ?? tour.image,
        sightseeing: [],
        activities: [],
      };
    });
  }

  return days.map((day) => {
    const dayNumber = day.day;
    const stayName = day.stay?.trim();
    return {
      day_number: dayNumber,
      title: day.title || `Day ${dayNumber}`,
      location: dayLocation(day, tour),
      day_image: day.image ?? tour.galleryImages?.[(dayNumber - 1) % (tour.galleryImages?.length || 1)] ?? tour.image,
      hotel_options: stayName
        ? [
            {
              id: `stay-opt-${dayNumber}`,
              name: stayName,
              stars: 3,
              description: day.meals?.trim() || `Stay in ${stayName}`,
              image_url: day.image ?? tour.image,
              images: tour.galleryImages ?? [tour.image],
              price_delta: 0,
              is_default: true,
              is_popular: true,
              dest_name: stayName,
              dest_nights: 1,
              room_type: "Deluxe Room",
              meals: mealsFlags(day.meals),
            },
          ]
        : undefined,
      sightseeing: sightseeingFromDay(day, dayNumber),
      activities: activitiesFromDay(day, dayNumber),
    };
  });
}

function buildStays(tour: TourPackage): NonNullable<KbcDayOptionsData["stays"]> {
  const groups = hotelGroupsFromTour(tour) as DestinationHotels[];
  return groups.map((group, index) => {
    const opt = group.opts[0] as HotelOption | undefined;
    const hotelId = opt?.hotelId || `hotel-${group.stayId || index}`;
    return {
      id: group.stayId || `stay-${index + 1}`,
      destination_city: group.dest,
      sort_order: index,
      nights: group.nights,
      is_active: true,
      default_hotel_id: hotelId,
      default_hotel_name: opt?.name ?? group.dest,
      default_room_type_name: opt?.roomType ?? "Deluxe Room",
      default_meal_plan: opt?.mealsIncluded?.[0] ?? "Breakfast",
      default_hotel_info: {
        star_category: opt?.stars ?? 3,
        thumbnail_url: opt?.img ?? tour.image,
        images: opt?.images ?? tour.galleryImages ?? [tour.image],
        amenities: opt?.amenities ?? ["Wifi", "Breakfast"],
        address: opt?.address ?? tour.location ?? null,
        description: opt?.hotelDescription ?? `Comfortable stay in ${group.dest}.`,
        rating: opt?.rating ?? 4.5,
        review_count: opt?.reviewCount ?? 24,
        check_in_time: opt?.checkInTime ?? "14:00",
        check_out_time: opt?.checkOutTime ?? "11:00",
        hotel_slug: opt?.hotelSlug ?? null,
        room_count: opt?.roomCount ?? 1,
      },
      hotel_options: (group.opts as HotelOption[]).map((hotel, hi) => ({
        id: hotel.id,
        hotel_id: hotel.hotelId || `${hotelId}-${hi}`,
        hotel_name: hotel.name,
        default_room_type_name: hotel.roomType ?? "Deluxe Room",
        sort_order: hi,
        upgrade_price: hotel.extra ?? 0,
        starting_price: hotel.startingPrice ?? null,
        room_count: hotel.roomCount ?? 1,
        image_url: hotel.img ?? tour.image,
        images: hotel.images ?? [hotel.img ?? tour.image],
        hotel_slug: hotel.hotelSlug ?? null,
        star_category: hotel.stars,
        thumbnail_url: hotel.img ?? tour.image,
        amenities: hotel.amenities ?? [],
        address: hotel.address ?? tour.location ?? null,
        city: tour.location?.split(",")[0] ?? null,
        description: hotel.hotelDescription ?? hotel.desc,
        rating: hotel.rating ?? 4.5,
        review_count: hotel.reviewCount ?? 0,
        check_in_time: hotel.checkInTime ?? "14:00",
        check_out_time: hotel.checkOutTime ?? "11:00",
      })),
    };
  });
}

function buildCabs(tour: TourPackage): KbcDayOptionsData["cabs"] {
  const cabs = cabOptionsFromTour(tour) as CabOption[];
  return cabs.map((cab, index) => ({
    id: cab.id,
    name: cab.name,
    description: cab.desc,
    seats: cab.seats,
    image_url: cab.img ?? null,
    price_delta: cab.price ?? cab.extra ?? 0,
    upgrade_price: cab.extra ?? 0,
    is_default: index === 0 || cab.extra === 0,
    is_popular: index === 0,
    sort_order: index,
  }));
}

function buildAddons(tour: TourPackage): KbcDayOptionsData["addons"] {
  const fromInclusions = (tour.inclusions ?? [])
    .slice(0, 4)
    .map((name, index) => ({
      id: `inc-${index}`,
      name,
      icon: "ShieldCheck",
      description: "Included in package",
      price_per_person: 0,
      is_default_on: true,
    }));

  if (fromInclusions.length) return fromInclusions;

  return [
    {
      id: "support",
      name: "24×7 trip assistance",
      icon: "Headphones",
      description: "On-trip support from KBC Trip",
      price_per_person: 0,
      is_default_on: true,
    },
  ];
}

/** Convert marketplace tour → day-options payload the customizer already understands. */
export function buildDayOptionsFromTour(tour: TourPackage): KbcDayOptionsData {
  return {
    package_id: tour.packageId ?? tour.id,
    base_price: tour.priceINR,
    token_type: "percent",
    token_amount: 40,
    balance_due_days: 7,
    is_customizable: tour.isCustomizable !== false,
    days: buildDays(tour),
    stays: buildStays(tour),
    cabs: buildCabs(tour),
    addons: buildAddons(tour),
  };
}

export function hotelGroupsFromDayOptions(data: KbcDayOptionsData): DestinationHotels[] {
  if (!data.stays?.length) return [];
  return data.stays.map((stay) => ({
    dest: stay.destination_city,
    nights: stay.nights,
    stayId: stay.id,
    opts: (stay.hotel_options ?? []).map((hotel, index) => {
      const isDefault = hotel.hotel_id === stay.default_hotel_id || index === 0;
      const img =
        hotel.thumbnail_url ||
        hotel.image_url ||
        hotel.images?.[0] ||
        stay.default_hotel_info?.thumbnail_url ||
        undefined;
      return {
        id: hotel.id,
        name: hotel.hotel_name,
        desc: hotel.default_room_type_name || stay.default_room_type_name || "Comfortable stay",
        stars: hotel.star_category ?? stay.default_hotel_info?.star_category ?? 3,
        extra: isDefault ? 0 : (hotel.upgrade_price ?? 0),
        priceStatus: "confirmed" as const,
        startingPrice: hotel.starting_price ?? undefined,
        roomCount: hotel.room_count,
        hotelId: hotel.hotel_id,
        hotelSlug: hotel.hotel_slug ?? undefined,
        pop: isDefault,
        img,
        images: hotel.images?.length
          ? hotel.images
          : img
            ? [img]
            : stay.default_hotel_info?.images ?? [],
        roomType: hotel.default_room_type_name || stay.default_room_type_name || undefined,
        mealsIncluded: stay.default_meal_plan ? [stay.default_meal_plan] : [],
        hotelDescription: hotel.description ?? stay.default_hotel_info?.description ?? null,
        rating: hotel.rating ?? stay.default_hotel_info?.rating ?? null,
        reviewCount: hotel.review_count ?? stay.default_hotel_info?.review_count ?? 0,
        address: hotel.address ?? stay.default_hotel_info?.address ?? null,
        amenities: hotel.amenities ?? stay.default_hotel_info?.amenities ?? [],
        checkInTime: hotel.check_in_time ?? stay.default_hotel_info?.check_in_time ?? null,
        checkOutTime: hotel.check_out_time ?? stay.default_hotel_info?.check_out_time ?? null,
      } satisfies HotelOption;
    }),
  }));
}

export function cabOptionsFromDayOptions(data: KbcDayOptionsData): CabOption[] {
  return [...data.cabs]
    .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.id,
      name: c.name,
      desc: c.description ?? "",
      seats: c.seats,
      extra: c.upgrade_price ?? 0,
      price: c.price_delta,
      pop: c.is_popular,
      img: c.image_url ?? undefined,
    }));
}

export function addonOptionsFromDayOptions(data: KbcDayOptionsData): AddonOption[] {
  return data.addons.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon ?? "ShieldCheck",
    note: a.description ?? "",
    price: a.price_per_person,
    on: a.is_default_on,
  }));
}
