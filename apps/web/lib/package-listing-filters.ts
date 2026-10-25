import type { TourPackage } from "@/lib/constants";
import { formatTourType } from "@/lib/packages";

export type ListingFilters = {
  prices: string[];
  types: string[];
  durations: string[];
  places: string[];
};

export const EMPTY_LISTING_FILTERS: ListingFilters = {
  prices: [],
  types: [],
  durations: [],
  places: [],
};

type Band = {
  id: string;
  label: string;
  match: (tour: TourPackage) => boolean;
};

export const PRICE_BANDS: Band[] = [
  { id: "under-15", label: "Under ₹15,000", match: (tour) => tour.priceINR > 0 && tour.priceINR < 15000 },
  { id: "15-25", label: "₹15,000 – ₹25,000", match: (tour) => tour.priceINR >= 15000 && tour.priceINR < 25000 },
  { id: "25-40", label: "₹25,000 – ₹40,000", match: (tour) => tour.priceINR >= 25000 && tour.priceINR < 40000 },
  { id: "40-plus", label: "₹40,000 & above", match: (tour) => tour.priceINR >= 40000 },
];

export const DURATION_BANDS: Band[] = [
  { id: "1-3", label: "1–3 days", match: (tour) => tour.durationDays >= 1 && tour.durationDays <= 3 },
  { id: "4-6", label: "4–6 days", match: (tour) => tour.durationDays >= 4 && tour.durationDays <= 6 },
  { id: "7-9", label: "7–9 days", match: (tour) => tour.durationDays >= 7 && tour.durationDays <= 9 },
  { id: "10-12", label: "10–12 days", match: (tour) => tour.durationDays >= 10 && tour.durationDays <= 12 },
  { id: "13-plus", label: "13+ days", match: (tour) => tour.durationDays >= 13 },
];

export type FilterOption = { id: string; label: string; count: number };

function splitParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((part) => decodeURIComponent(part.trim())).filter(Boolean);
}

function writeList(params: URLSearchParams, key: string, values: string[]) {
  if (values.length === 0) params.delete(key);
  else params.set(key, values.map((value) => encodeURIComponent(value)).join(","));
}

export function readListingFilters(params: { get(name: string): string | null }): ListingFilters {
  return {
    prices: splitParam(params.get("price")),
    types: splitParam(params.get("ptype")),
    durations: splitParam(params.get("days")),
    places: splitParam(params.get("place")),
  };
}

export function listingFiltersActive(filters: ListingFilters): boolean {
  return filters.prices.length + filters.types.length + filters.durations.length + filters.places.length > 0;
}

export function withListingFilters(current: URLSearchParams, filters: ListingFilters): string {
  const params = new URLSearchParams(current.toString());
  writeList(params, "price", filters.prices);
  writeList(params, "ptype", filters.types);
  writeList(params, "days", filters.durations);
  writeList(params, "place", filters.places);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function packagePlace(tour: TourPackage): string | null {
  const departure = tour.departureCity?.trim();
  if (departure) return departure;
  const destination = tour.location?.split(",")[0]?.trim();
  return destination || null;
}

export function packageTypeLabel(tour: TourPackage): string {
  return formatTourType(tour.packageType);
}

function countBands(tours: TourPackage[], bands: Band[]): FilterOption[] {
  return bands
    .map((band) => ({
      id: band.id,
      label: band.label,
      count: tours.filter((tour) => band.match(tour)).length,
    }))
    .filter((option) => option.count > 0);
}

function countLabels(tours: TourPackage[], labelOf: (tour: TourPackage) => string | null): FilterOption[] {
  const counts = new Map<string, FilterOption>();
  for (const tour of tours) {
    const label = labelOf(tour)?.trim();
    if (!label) continue;
    const current = counts.get(label);
    if (current) current.count += 1;
    else counts.set(label, { id: label, label, count: 1 });
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function priceOptions(tours: TourPackage[]): FilterOption[] {
  return countBands(tours, PRICE_BANDS);
}

export function durationOptions(tours: TourPackage[]): FilterOption[] {
  return countBands(tours, DURATION_BANDS);
}

export function typeOptions(tours: TourPackage[]): FilterOption[] {
  return countLabels(tours, packageTypeLabel);
}

export function placeOptions(tours: TourPackage[]): FilterOption[] {
  return countLabels(tours, packagePlace);
}

export function tourMatchesListingFilters(tour: TourPackage, filters: ListingFilters): boolean {
  if (filters.prices.length > 0) {
    const matched = PRICE_BANDS.some((band) => filters.prices.includes(band.id) && band.match(tour));
    if (!matched) return false;
  }
  if (filters.types.length > 0 && !filters.types.includes(packageTypeLabel(tour))) return false;
  if (filters.durations.length > 0) {
    const matched = DURATION_BANDS.some((band) => filters.durations.includes(band.id) && band.match(tour));
    if (!matched) return false;
  }
  if (filters.places.length > 0) {
    const place = packagePlace(tour);
    if (!place || !filters.places.includes(place)) return false;
  }
  return true;
}
