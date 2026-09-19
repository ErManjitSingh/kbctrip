"use client";

/**
 * Day-options for the package customizer — built from KBC marketplace
 * packages only. No Unotrips day-options API calls.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TourPackage } from "@/lib/constants";
import {
  addonOptionsFromDayOptions,
  buildDayOptionsFromTour,
  cabOptionsFromDayOptions,
  hotelGroupsFromDayOptions,
} from "@/lib/kbc-day-options";
import { getPackageBySlug } from "@/services/packages";

// ── API shapes kept for ActivitiesTab / customizer compatibility ─────────────

export type DaySightseeing = {
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

export type DayActivity = {
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

export type DayOption = {
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
    thumbnail_url?: string | null;
    images?: string[];
    price_delta: number;
    is_default: boolean;
    is_popular: boolean;
    dest_name?: string;
    dest_nights?: number;
    room_type?: string;
    max_guests?: number;
    extra_bed_price?: number;
    meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
    meal_prices?: { breakfast: number; lunch: number; dinner: number };
  }>;
  sightseeing: DaySightseeing[];
  activities: DayActivity[];
};

export type DayOptionsData = {
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
      state?: string | null;
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

export function useDayOptions(
  slug: string,
  _travelDate?: string | null,
  seedTour?: TourPackage | null,
) {
  const query = useQuery({
    queryKey: ["packages", "kbc-day-options", slug],
    queryFn: async () => {
      if (seedTour && (seedTour.slug === slug || seedTour.id === slug)) {
        return buildDayOptionsFromTour(seedTour);
      }
      const pack = await getPackageBySlug(slug);
      if (!pack) throw new Error("Package not found");
      return buildDayOptionsFromTour(pack);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: Boolean(slug),
    initialData: seedTour ? buildDayOptionsFromTour(seedTour) : undefined,
  });

  const data = query.data;

  const hotelGroups = useMemo(
    () => (data ? hotelGroupsFromDayOptions(data) : []),
    [data],
  );
  const cabOptions = useMemo(
    () => (data ? cabOptionsFromDayOptions(data) : []),
    [data],
  );
  const addonOptions = useMemo(
    () => (data ? addonOptionsFromDayOptions(data) : []),
    [data],
  );
  const days = useMemo(() => data?.days ?? [], [data]);

  return {
    isLoading: query.isLoading && !data,
    isError: query.isError,
    raw: data,
    hotelGroups,
    cabOptions,
    addonOptions,
    usingDemo: false,
    days,
    basePrice: data?.base_price ?? seedTour?.priceINR ?? null,
    tokenType: data?.token_type ?? "percent",
    tokenAmount: data?.token_amount ?? 40,
    balanceDays: data?.balance_due_days ?? 7,
  };
}
