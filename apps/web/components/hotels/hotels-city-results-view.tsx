"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Clock, Search, SlidersHorizontal } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { HotelResultCard } from "@/components/hotels/hotel-result-card";
import {
  EMPTY_HOTEL_FILTERS,
  HotelsResultsFilters,
  type HotelFiltersState,
} from "@/components/hotels/hotels-results-filters";
import {
  HotelsResultsSearchStrip,
  type HotelModifySearchPayload,
} from "@/components/hotels/hotels-results-search-strip";
import {
  HOTEL_PRICE_BANDS,
  distanceKmBetween,
  findHotelLocality,
  hotelResultsHref,
  type HotelBookingQueryParams,
  type HotelCity,
  type HotelDestinationOption,
  type HotelListing,
  type HotelSortOption,
} from "@/lib/hotels-catalog";
import { searchHotels } from "@/lib/hotels-api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function HotelResultsEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-[#d5e0dc] bg-white px-6 py-12 text-center shadow-[0_1px_3px_rgba(12,18,16,0.04)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f7f5] text-[#0f766e]">
        <Building2 className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 text-base font-bold text-[#0c1210]">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#5a6560]">{description}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

function HotelResultCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#d5e0dc] bg-white" aria-hidden>
      <div className="flex flex-col lg:flex-row">
        <Skeleton className="h-[200px] w-full rounded-none bg-[#e8eeec] lg:h-auto lg:w-[260px]" />
        <div className="flex-1 space-y-3 p-4">
          <Skeleton className="h-5 w-2/3 bg-[#e8eeec]" />
          <Skeleton className="h-3.5 w-1/2 bg-[#e8eeec]" />
          <Skeleton className="h-3.5 w-3/4 bg-[#e8eeec]" />
          <Skeleton className="h-16 w-full bg-[#e8eeec]" />
        </div>
        <div className="flex w-full flex-col gap-2 border-t border-[#e8eeec] bg-[#f3f7f5]/60 p-4 lg:w-[200px] lg:border-l lg:border-t-0">
          <Skeleton className="ml-auto h-6 w-16 bg-[#e8eeec]" />
          <Skeleton className="ml-auto h-8 w-24 bg-[#e8eeec]" />
          <Skeleton className="h-10 w-full bg-[#e8eeec]" />
        </div>
      </div>
    </div>
  );
}

const HOTELS_PER_PAGE = 5;

function applyFilters(
  hotels: HotelListing[],
  filters: HotelFiltersState,
): HotelListing[] {
  const matchAny = (haystack: string[], needles: string[]) => {
    const source = haystack.map((x) => x.trim().toLowerCase()).filter(Boolean);
    return needles.some((needle) => source.includes(needle.trim().toLowerCase()));
  };

  return hotels.filter((h) => {
    if (filters.bookWithZero && !h.bookWithZero) return false;
    if (filters.freeCancellation && !h.freeCancellation) return false;
    if (filters.freeBreakfast && !h.freeBreakfast) return false;
    if (filters.freeParking && !h.freeParking) return false;
    if (filters.stars.length > 0 && !filters.stars.includes(h.stars))
      return false;
    if (filters.priceBands.length > 0) {
      const inBand = filters.priceBands.some((bandId) => {
        const band = HOTEL_PRICE_BANDS.find((b) => b.id === bandId);
        if (!band) return false;
        return h.price >= band.min && h.price <= band.max;
      });
      if (!inBand) return false;
    }
    if (filters.amenities.length > 0 && !matchAny(h.amenities, filters.amenities)) {
      return false;
    }
    if (filters.propertyTypes.length > 0 && !matchAny(h.tags, filters.propertyTypes)) {
      return false;
    }
    return true;
  });
}

function sortHotels(
  hotels: HotelListing[],
  sort: HotelSortOption,
): HotelListing[] {
  const copy = [...hotels];
  switch (sort) {
    case "price-low":
      return copy.sort((a, b) => a.price - b.price);
    case "price-high":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

type HotelsCityResultsViewProps = {
  city: HotelCity;
  hotels: HotelListing[];
  destinations?: HotelDestinationOption[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRooms?: number;
  initialGuests?: number;
  initialLastMinute?: boolean;
  initialSort?: HotelSortOption;
  initialSearchQuery?: string;
};

export function HotelsCityResultsView({
  city: initialCity,
  hotels: initialHotels,
  destinations = [],
  initialCheckIn,
  initialCheckOut,
  initialRooms,
  initialGuests,
  initialLastMinute = false,
  initialSort = "popularity",
  initialSearchQuery = "",
}: HotelsCityResultsViewProps) {
  const [city, setCity] = useState(initialCity);
  const [hotels, setHotels] = useState(initialHotels);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] =
    useState<HotelFiltersState>(EMPTY_HOTEL_FILTERS);
  const [sort, setSort] = useState<HotelSortOption>(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [lastMinuteOnly, setLastMinuteOnly] = useState(initialLastMinute);
  const [bookingContext, setBookingContext] = useState<HotelBookingQueryParams>({
    check_in: initialCheckIn,
    check_out: initialCheckOut,
    rooms: initialRooms,
    guests: initialGuests,
  });

  const filtered = useMemo(() => {
    let list = applyFilters(hotels, filters);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.area.toLowerCase().includes(q) ||
          h.locationLine.toLowerCase().includes(q) ||
          (h.address?.toLowerCase().includes(q) ?? false),
      );
    }
    if (lastMinuteOnly) {
      list = list.filter((h) => h.dealOfDay);
    }
    return sortHotels(list, sort);
  }, [hotels, filters, searchQuery, lastMinuteOnly, sort]);

  const displayHotels = useMemo(() => {
    const locality = findHotelLocality(searchQuery);
    if (!locality) return filtered;
    return filtered
      .map((hotel) => {
        if (hotel.latitude == null || hotel.longitude == null) {
          return { ...hotel, searchLocationLabel: locality.name };
        }
        return {
          ...hotel,
          searchLocationLabel: locality.name,
          distanceFromSearchKm: distanceKmBetween(locality, {
            latitude: hotel.latitude,
            longitude: hotel.longitude,
          }),
        };
      })
      .sort((a, b) => (a.distanceFromSearchKm ?? Infinity) - (b.distanceFromSearchKm ?? Infinity));
  }, [filtered, searchQuery]);

  const total = displayHotels.length;
  const totalPages = Math.max(1, Math.ceil(total / HOTELS_PER_PAGE));
  const [page, setPage] = useState(1);

  const listKey = useMemo(
    () => displayHotels.map((h) => h.id).join("|"),
    [displayHotels],
  );

  useEffect(() => {
    setPage(1);
  }, [listKey]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * HOTELS_PER_PAGE;
  const end = Math.min(start + HOTELS_PER_PAGE, total);
  const pageHotels = useMemo(
    () => displayHotels.slice(start, start + HOTELS_PER_PAGE),
    [displayHotels, start],
  );

  const scrollToResults = () => {
    document
      .getElementById("hotel-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPage = (next: number) => {
    const p = Math.min(Math.max(1, next), totalPages);
    setPage(p);
    scrollToResults();
  };

  const handleModifySearch = async (payload: HotelModifySearchPayload) => {
    setSearching(true);
    try {
      const { hotels: nextHotels } = await searchHotels({
        city: payload.city,
        q: payload.q,
        check_in: payload.check_in,
        check_out: payload.check_out,
        adults: payload.guests,
        rooms: payload.rooms,
        limit: 50,
        sort: "popular",
      });

      setCity({
        slug: payload.slug,
        name: payload.city,
        fullLocation: payload.fullLocation,
      });
      setHotels(nextHotels);
      setFilters(EMPTY_HOTEL_FILTERS);
      setSearchQuery(payload.q ?? "");
      setLastMinuteOnly(false);
      setBookingContext({
        check_in: payload.check_in,
        check_out: payload.check_out,
        rooms: payload.rooms,
        guests: payload.guests,
      });
      setPage(1);

      window.history.replaceState(
        null,
        "",
        hotelResultsHref(payload.slug, {
          check_in: payload.check_in,
          check_out: payload.check_out,
          rooms: payload.rooms,
          guests: payload.guests,
          q: payload.q,
          last_minute: lastMinuteOnly || undefined,
          sort: sort !== "popularity" ? sort : undefined,
        }),
      );

      document
        .getElementById("hotel-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f3f7f5] text-[#0c1210] antialiased">
        <Suspense fallback={null}>
          <HotelsResultsSearchStrip
            city={city}
            destinations={destinations}
            searching={searching}
            onSearch={handleModifySearch}
          />
        </Suspense>

        <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          {/* Sticky filter / search bar (especially useful on mobile) */}
          <div className="sticky top-0 z-30 -mx-3 border-b border-[#d5e0dc] bg-white/95 px-3 py-3 shadow-[0_4px_16px_-12px_rgba(12,18,16,0.18)] backdrop-blur-md sm:static sm:mx-0 sm:rounded-xl sm:border sm:px-4 sm:shadow-[0_1px_3px_rgba(12,18,16,0.04)] sm:backdrop-blur-none">
            <nav
              className="mb-2.5 flex flex-wrap items-center gap-1 text-[12px] text-[#0f766e] sm:mb-3 sm:text-[13px]"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-[#8a948e]"
                aria-hidden
              />
              <Link href="/hotels" className="hover:underline">
                Hotels
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-[#8a948e]"
                aria-hidden
              />
              <span className="font-medium text-[#0c1210]">
                Hotels in {city.name}
              </span>
            </nav>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <label className="relative flex min-w-0 flex-1 items-center">
                <Search
                  className="pointer-events-none absolute left-3 h-4 w-4 text-[#8a948e]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter hotel name or location"
                  className="h-10 w-full rounded-lg border border-[#d5e0dc] bg-white pl-9 pr-3 text-[13px] text-[#0c1210] outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/25"
                />
              </label>
              <div className="flex items-center gap-2">
                <a
                  href="#hotel-filters"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#d5e0dc] bg-[#f3f7f5] px-3 text-[13px] font-semibold text-[#0c1210] lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#0f766e]" aria-hidden />
                  Filters
                </a>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as HotelSortOption)}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-[#d5e0dc] bg-white px-3 text-[13px] font-medium text-[#0c1210] outline-none focus:border-[#0f766e] sm:flex-none"
                  aria-label="Sort hotels"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Guest Rating</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
            <div id="hotel-filters" className="w-full shrink-0 scroll-mt-28 lg:sticky lg:top-24 lg:w-[260px] lg:self-start xl:w-[280px]">
              <HotelsResultsFilters
                hotels={hotels}
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(EMPTY_HOTEL_FILTERS)}
              />
            </div>

            <div id="hotel-results" className="min-w-0 flex-1 scroll-mt-28">
              <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-[#d5e0dc] bg-white px-3 py-2.5 text-[13px] font-medium text-[#0c1210] shadow-[0_1px_3px_rgba(12,18,16,0.04)]">
                <input
                  type="checkbox"
                  checked={lastMinuteOnly}
                  onChange={(e) => setLastMinuteOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-[#BDBDBD] accent-[#0f766e]"
                />
                <Clock className="h-4 w-4 text-[#0f766e]" aria-hidden />
                Last Minute Deals
              </label>

              <p className="mb-3 text-[13px] text-[#5a6560]">
                {searching ? (
                  <>Updating results…</>
                ) : hotels.length === 0 ? (
                  <>No hotels listed in {city.name} yet</>
                ) : total === 0 ? (
                  <>No properties match your filters in {city.name}</>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[#0c1210]">
                      {start + 1}–{end}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#0c1210]">
                      {total}
                    </span>{" "}
                    properties in {city.name}
                  </>
                )}
              </p>

              <div className="flex flex-col gap-3 sm:gap-4">
                {searching ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <HotelResultCardSkeleton key={i} />
                  ))
                ) : hotels.length === 0 ? (
                  <HotelResultsEmpty
                    title="No hotels in this destination yet"
                    description="Check back soon or search another city from the hotels home page."
                    action={
                      <Link
                        href="/hotels"
                        className="inline-flex rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59]"
                      >
                        Browse all destinations
                      </Link>
                    }
                  />
                ) : total === 0 ? (
                  <HotelResultsEmpty
                    title="No hotels match your filters"
                    description="Try resetting filters or changing your search."
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          setFilters(EMPTY_HOTEL_FILTERS);
                          setSearchQuery("");
                          setLastMinuteOnly(false);
                          setPage(1);
                        }}
                        className="inline-flex rounded-lg border border-[#d5e0dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f766e] hover:border-[#0f766e]/40"
                      >
                        Reset filters
                      </button>
                    }
                  />
                ) : (
                  <>
                    {pageHotels.map((hotel) => (
                      <HotelResultCard key={hotel.id} hotel={hotel} bookingContext={bookingContext} />
                    ))}

                    {totalPages > 1 ? (
                      <nav
                        className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-[#d5e0dc] bg-white px-3 py-4 sm:flex-row sm:justify-between sm:px-4"
                        aria-label="Hotel list pagination"
                      >
                        <p className="order-2 text-center text-xs text-[#5a6560] sm:order-1 sm:text-left">
                          Showing{" "}
                          <span className="font-semibold text-[#0c1210]">
                            {start + 1}–{end}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold text-[#0c1210]">
                            {total}
                          </span>{" "}
                          properties · Page {safePage} of {totalPages}
                        </p>
                        <div className="order-1 flex flex-wrap items-center justify-center gap-1.5 sm:order-2">
                          <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => goToPage(safePage - 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#d5e0dc] bg-white px-3 text-xs font-semibold text-[#0c1210] transition hover:border-[#0f766e]/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden />
                            Prev
                          </button>
                          <div className="flex items-center gap-1 px-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => goToPage(n)}
                                className={cn(
                                  "flex h-9 min-w-9 items-center justify-center rounded-md border text-xs font-semibold transition",
                                  n === safePage
                                    ? "border-[#0f766e] bg-[#0f766e] text-white shadow-sm"
                                    : "border-[#d5e0dc] bg-white text-[#5a6560] hover:border-[#0f766e]/40 hover:text-[#0f766e]",
                                )}
                                aria-label={`Page ${n}`}
                                aria-current={
                                  n === safePage ? "page" : undefined
                                }
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            disabled={safePage >= totalPages}
                            onClick={() => goToPage(safePage + 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#d5e0dc] bg-white px-3 text-xs font-semibold text-[#0c1210] transition hover:border-[#0f766e]/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </nav>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#0f766e] text-white shadow-lg transition hover:bg-[#115e59] sm:right-6"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      </main>
      <Footer />
    </>
  );
}
