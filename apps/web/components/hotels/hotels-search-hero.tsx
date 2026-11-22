"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, Hourglass, ShieldCheck } from "lucide-react";
import { HotelSearchLoadingOverlay } from "@/components/hotels/hotel-search-loading-overlay";
import {
  addDaysToIso,
  formatHotelDateFromIso,
  HotelRoomsGuestsField,
  localDateInputString,
} from "@/components/hotels/hotels-search-fields";
import {
  HotelLocationField,
  reverseGeocodeCity,
} from "@/components/hotels/hotels-location-field";
import { DatePickerPopover } from "@/components/hotels/hotel-date-range-picker";
import {
  hotelResultsHref,
  hotelDetailHref,
  hotelListingKey,
  findHotelLocality,
  matchHotelDestinationFromList,
  slugifyCityName,
  type HotelDestinationOption,
  type HotelLocalityOption,
  type HotelSortOption,
} from "@/lib/hotels-catalog";
import { fetchHotelDestinations, fetchHotelLocalities } from "@/services/hotels";
import { PARTNER_PORTAL_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { HotelListing } from "@/lib/hotels-api";

type HotelsSearchHeroProps = {
  className?: string;
  destinations?: HotelDestinationOption[];
  defaultCity?: string;
  defaultCountry?: string;
  defaultSlug?: string;
};

function SplitDateField({
  checkInIso,
  checkOutIso,
  todayIso,
  onChange,
}: {
  checkInIso: string;
  checkOutIso: string;
  todayIso: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const [open, setOpen] = useState<"in" | "out" | null>(null);
  const checkInFmt = formatHotelDateFromIso(checkInIso);
  const checkOutFmt = formatHotelDateFromIso(checkOutIso);

  return (
    <div className="relative flex min-w-0 flex-1 divide-x divide-[#e8e8e8]">
      <button
        type="button"
        onClick={() => setOpen((v) => (v === "in" ? null : "in"))}
        aria-haspopup="dialog"
        aria-expanded={open === "in"}
        className="flex min-h-[78px] min-w-0 flex-1 items-start gap-2.5 px-3 py-3.5 text-left transition-colors hover:bg-[#f7fbff] sm:px-4"
      >
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#757575]" strokeWidth={1.7} aria-hidden />
        <span className="min-w-0">
          <span className="block text-[11px] font-medium text-[#9E9E9E]">Check-In</span>
          <span className="mt-0.5 block truncate text-[16px] font-bold leading-tight text-[#212121] sm:text-[17px]">
            {checkInFmt.main}
          </span>
          <span className="mt-0.5 block text-[12px] text-[#757575]">{checkInFmt.sub || "Start date"}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => (v === "out" ? null : "out"))}
        aria-haspopup="dialog"
        aria-expanded={open === "out"}
        className="flex min-h-[78px] min-w-0 flex-1 items-start gap-2.5 px-3 py-3.5 text-left transition-colors hover:bg-[#f7fbff] sm:px-4"
      >
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#757575]" strokeWidth={1.7} aria-hidden />
        <span className="min-w-0">
          <span className="block text-[11px] font-medium text-[#9E9E9E]">Check-Out</span>
          <span className="mt-0.5 block truncate text-[16px] font-bold leading-tight text-[#212121] sm:text-[17px]">
            {checkOutFmt.main}
          </span>
          <span className="mt-0.5 block text-[12px] text-[#757575]">{checkOutFmt.sub || "End date"}</span>
        </span>
      </button>

      {open ? (
        <DatePickerPopover
          checkIn={checkInIso}
          checkOut={checkOutIso}
          compact
          onChange={(ci, co) => {
            const nextCheckIn = ci || todayIso;
            onChange(nextCheckIn, co || (ci ? addDaysToIso(ci, 1) : ""));
            if (ci && co) setOpen(null);
          }}
          onApply={() => setOpen(null)}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}

export function HotelsSearchHero({
  className,
  destinations = [],
  defaultCity = "",
  defaultCountry = "India",
  defaultSlug = "",
}: HotelsSearchHeroProps) {
  const router = useRouter();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const checkInDefaultIso = useMemo(() => localDateInputString(addDays(today, 1)), [today]);
  const checkOutDefaultIso = useMemo(() => addDaysToIso(checkInDefaultIso, 1), [checkInDefaultIso]);

  const [city, setCity] = useState(defaultCity);
  const [country, setCountry] = useState(defaultCountry);
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [searchCitySlug, setSearchCitySlug] = useState(defaultSlug);
  const [searchLocation, setSearchLocation] = useState("");
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [checkInIso, setCheckInIso] = useState(checkInDefaultIso);
  const [checkOutIso, setCheckOutIso] = useState(checkOutDefaultIso);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastMinute, setLastMinute] = useState(false);
  const [priceGuarantee, setPriceGuarantee] = useState(true);

  const { data: fetchedDestinations } = useQuery({
    queryKey: ["hotels", "search-destinations"],
    queryFn: async () => {
      const list = await fetchHotelDestinations();
      return list.map((d) => ({ slug: d.slug, city: d.city, state: d.state, country: d.country }));
    },
    enabled: destinations.length === 0,
    staleTime: 5 * 60 * 1000,
  });

  const { data: fetchedLocalities } = useQuery({
    queryKey: ["hotels", "search-localities"],
    queryFn: () => fetchHotelLocalities(),
    staleTime: 10 * 60 * 1000,
  });

  const effectiveDestinations = destinations.length > 0 ? destinations : (fetchedDestinations ?? []);

  useEffect(() => {
    if (defaultCity) setCity(defaultCity);
    if (defaultCountry) setCountry(defaultCountry);
    if (defaultSlug) setSelectedSlug(defaultSlug);
    if (defaultSlug) setSearchCitySlug(defaultSlug);
  }, [defaultCity, defaultCountry, defaultSlug]);

  const handleDateRangeChange = (checkIn: string, checkOut: string) => {
    setCheckInIso(checkIn);
    setCheckOutIso(checkOut && checkOut > checkIn ? checkOut : addDaysToIso(checkIn, 1));
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    setSelectedSlug("");
    setSearchLocation(value);
    setNearMeActive(false);
    setNearMeError(null);
    setSearchError(null);
  };

  const handleSelectDestination = (dest: HotelDestinationOption) => {
    setCity(dest.city);
    setCountry(dest.country);
    setSelectedSlug(dest.slug);
    setSearchCitySlug(dest.slug);
    setSearchLocation("");
    setNearMeActive(false);
    setSearchError(null);
  };

  const handleSelectLocality = (locality: HotelLocalityOption) => {
    setCity(locality.name);
    setCountry(`${locality.city}, ${locality.country}`);
    setSelectedSlug(locality.citySlug);
    setSearchCitySlug(locality.citySlug);
    setSearchLocation(locality.name);
    setNearMeActive(false);
    setSearchError(null);
  };

  const handleSelectHotel = (hotel: HotelListing) => {
    const q = new URLSearchParams({
      check_in: checkInIso,
      check_out: checkOutIso,
      rooms: String(rooms),
      guests: String(guests),
    });
    router.push(`${hotelDetailHref(hotel.citySlug, hotelListingKey(hotel))}?${q.toString()}`);
  };

  const handleSearch = () => {
    setSearchError(null);
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setSearchError("Please enter a city or hotel location");
      return;
    }
    if (!checkInIso) {
      setSearchError("Please select check-in date");
      return;
    }
    if (!checkOutIso || checkOutIso <= checkInIso) {
      setSearchError("Check-out must be after check-in");
      return;
    }

    const localQuery = trimmedCity.toLowerCase();
    const isExactDestination =
      selectedSlug === slugifyCityName(trimmedCity) ||
      effectiveDestinations.some(
        (item) =>
          item.city.toLowerCase() === localQuery ||
          item.slug === slugifyCityName(trimmedCity),
      );
    const locality =
      (fetchedLocalities ?? []).find(
        (item) =>
          item.slug === slugifyCityName(trimmedCity) ||
          item.name.toLowerCase() === localQuery ||
          `${item.name} ${item.city}`.toLowerCase() === localQuery,
      ) ?? (isExactDestination ? null : findHotelLocality(trimmedCity));
    const matched = matchHotelDestinationFromList(locality?.city ?? trimmedCity, effectiveDestinations);
    const slug =
      selectedSlug || locality?.citySlug || matched?.slug || searchCitySlug || slugifyCityName(trimmedCity);
    const q =
      searchLocation.trim() || locality?.name || (!matched && selectedSlug ? trimmedCity : undefined);

    if (matched && !selectedSlug) {
      setSelectedSlug(matched.slug);
      setSearchCitySlug(matched.slug);
      setCountry(matched.country);
    }

    const sort: HotelSortOption | undefined = undefined;
    setIsSearching(true);
    router.push(
      hotelResultsHref(slug, {
        check_in: checkInIso,
        check_out: checkOutIso,
        rooms,
        guests,
        q,
        sort,
        last_minute: lastMinute || undefined,
      }),
    );
  };

  const handleNearMe = () => {
    setNearMeError(null);
    setSearchError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNearMeError("Location not supported on this device");
      return;
    }
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { city: resolvedCity, country: resolvedCountry } = await reverseGeocodeCity(
            position.coords.latitude,
            position.coords.longitude,
          );
          const match = matchHotelDestinationFromList(resolvedCity, effectiveDestinations);
          if (match) {
            setCity(match.city);
            setCountry(match.country);
            setSelectedSlug(match.slug);
            setSearchCitySlug(match.slug);
            setSearchLocation("");
          } else {
            setCity(resolvedCity);
            setCountry(resolvedCountry);
            setSelectedSlug("");
            setSearchCitySlug("");
            setSearchLocation(resolvedCity);
          }
          setNearMeActive(true);
        } catch {
          setNearMeError("Unable to detect city. Try again.");
          setNearMeActive(false);
        } finally {
          setNearMeLoading(false);
        }
      },
      (error) => {
        setNearMeLoading(false);
        setNearMeActive(false);
        if (error.code === error.PERMISSION_DENIED) setNearMeError("Allow location access to use Near Me");
        else if (error.code === error.TIMEOUT) setNearMeError("Location timed out. Try again.");
        else setNearMeError("Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <section id="hotel-search" className={cn("relative w-full bg-[#2196f3]", className)}>
      <div className="mx-auto w-full max-w-[1180px] px-3 pb-5 pt-6 sm:px-4 sm:pb-6 sm:pt-8 lg:px-6">
        <h1 className="text-center text-[22px] font-bold leading-tight tracking-tight text-white sm:text-[28px] lg:text-[32px]">
          Same hotel, Cheapest price. Guaranteed!
        </h1>

        <form
          className="relative z-20 mt-5 overflow-visible rounded-xl bg-white shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:mt-6"
          role="search"
          aria-busy={isSearching}
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSearching) handleSearch();
          }}
        >
          {isSearching && <HotelSearchLoadingOverlay />}

          <div
            className={cn(
              "flex flex-col overflow-visible lg:flex-row lg:items-stretch",
              isSearching && "pointer-events-none select-none opacity-60",
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col divide-y divide-[#e8e8e8] lg:flex-row lg:divide-x lg:divide-y-0">
              <HotelLocationField
                className="min-w-0 flex-[1.15]"
                city={city}
                country={country}
                destinations={effectiveDestinations}
                localities={fetchedLocalities}
                nearMeActive={nearMeActive}
                nearMeLoading={nearMeLoading}
                nearMeError={nearMeError}
                searchError={searchError}
                onCityChange={handleCityChange}
                onSelectDestination={handleSelectDestination}
                onSelectLocality={handleSelectLocality}
                onSelectHotel={handleSelectHotel}
                onNearMe={handleNearMe}
              />
              <SplitDateField
                checkInIso={checkInIso}
                checkOutIso={checkOutIso}
                todayIso={localDateInputString(today)}
                onChange={handleDateRangeChange}
              />
              <HotelRoomsGuestsField
                className="min-w-0 flex-[0.85]"
                rooms={rooms}
                guests={guests}
                onRoomsChange={setRooms}
                onGuestsChange={setGuests}
                childrenAges={childrenAges}
                onChildrenAgesChange={setChildrenAges}
              />
            </div>

            <div className="flex items-stretch p-2.5 sm:p-3">
              <button
                type="submit"
                disabled={isSearching}
                className="flex h-[52px] w-full items-center justify-center rounded-lg bg-[#ef6c00] px-8 text-[15px] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#e65100] disabled:cursor-wait disabled:opacity-80 lg:h-auto lg:min-w-[128px]"
              >
                {isSearching ? "…" : "Search"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-3.5 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2.5">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15">
              <Hourglass className="h-3.5 w-3.5 text-white/90" aria-hidden />
              Last Minute Deals
              <span
                className={cn(
                  "ml-1 flex h-4 w-4 items-center justify-center rounded border",
                  lastMinute ? "border-white bg-white text-[#2196f3]" : "border-white/70 bg-transparent",
                )}
              >
                {lastMinute ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={lastMinute}
                onChange={(e) => setLastMinute(e.target.checked)}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a5d6a7]" aria-hidden />
              Lowest Price Guarantee
              <span
                className={cn(
                  "ml-1 flex h-4 w-4 items-center justify-center rounded border",
                  priceGuarantee ? "border-white bg-white text-[#2196f3]" : "border-white/70 bg-transparent",
                )}
              >
                {priceGuarantee ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={priceGuarantee}
                onChange={(e) => setPriceGuarantee(e.target.checked)}
              />
            </label>
          </div>
          <Link
            href={PARTNER_PORTAL_URL}
            className="text-[12px] font-semibold text-white/95 underline-offset-2 hover:underline sm:text-[13px]"
          >
            List Your Hotel For Free
          </Link>
        </div>
      </div>
    </section>
  );
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
