"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, ChevronRight, MapPin, Search } from "lucide-react";
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
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";
import { cn } from "@/lib/utils";
import type { HotelListing } from "@/lib/hotels-api";
import { HotelsHeroSkeleton } from "@/components/hotels/hotels-page-skeleton";

const HOTELS_BANNER_IMAGE = "/images/home/lite/hero-mobile.jpg";

type HotelsSearchHeroProps = {
  className?: string;
  destinations?: HotelDestinationOption[];
  defaultCity?: string;
  defaultCountry?: string;
  defaultSlug?: string;
};

const QUICK_DESTINATIONS = [
  { city: "Anjuna", slug: "anjuna" },
  { city: "Goa", slug: "goa" },
  { city: "Jaipur", slug: "jaipur" },
  { city: "Manali", slug: "manali" },
];

function HeroDateRangeField({
  checkInIso,
  checkOutIso,
  todayIso,
  onChange,
  className,
}: {
  checkInIso: string;
  checkOutIso: string;
  todayIso: string;
  onChange: (checkIn: string, checkOut: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const checkInFmt = formatHotelDateFromIso(checkInIso);
  const checkOutFmt = formatHotelDateFromIso(checkOutIso);

  return (
    <div className={cn("relative min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-[72px] w-full min-w-0 items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f8fbfa] sm:min-h-[76px] sm:px-5"
      >
        <CalendarRange className="mt-0.5 h-5 w-5 shrink-0 text-[#0f766e]" strokeWidth={1.6} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium leading-tight text-[#98a2b3]">Check-In / Check-Out</span>
          <span className="mt-1 block truncate text-[16px] font-bold leading-tight text-[#15202b]">
            {checkInFmt.main}
            <span className="mx-1 text-[#98a2b3]">→</span>
            {checkOutFmt.main}
          </span>
          <span className="mt-0.5 block truncate text-xs font-normal text-[#7b8491]">
            {checkInFmt.sub || "Start date"}{" "}
            <span className="text-[#d9ebe7]">•</span>{" "}
            {checkOutFmt.sub || "End date"}
          </span>
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
            if (ci && co) setOpen(false);
          }}
          onApply={() => setOpen(false)}
          onClose={() => setOpen(false)}
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

  const checkInDefaultIso  = useMemo(() => localDateInputString(addDays(today, 1)),  [today]);
  const checkOutDefaultIso = useMemo(() => addDaysToIso(checkInDefaultIso, 1),       [checkInDefaultIso]);

  const [city,           setCity]           = useState(defaultCity);
  const [country,        setCountry]        = useState(defaultCountry);
  const [selectedSlug,   setSelectedSlug]   = useState(defaultSlug);
  // Keep the current destination available while the user types a hotel name.
  // The visible input is also used for free-text hotel searches, so it must not
  // become the city slug sent in the results URL.
  const [searchCitySlug, setSearchCitySlug] = useState(defaultSlug);
  const [searchLocation, setSearchLocation] = useState("");
  const [nearMeActive,   setNearMeActive]   = useState(false);
  const [nearMeLoading,  setNearMeLoading]  = useState(false);
  const [nearMeError,    setNearMeError]    = useState<string | null>(null);
  const [searchError,    setSearchError]    = useState<string | null>(null);
  const [checkInIso,     setCheckInIso]     = useState(checkInDefaultIso);
  const [checkOutIso,    setCheckOutIso]    = useState(checkOutDefaultIso);
  const [rooms,          setRooms]          = useState(1);
  const [guests,         setGuests]         = useState(2);
  const [childrenAges,   setChildrenAges]   = useState<number[]>([]);
  const [bannerLoaded,   setBannerLoaded]   = useState(false);
  const [isSearching,    setIsSearching]    = useState(false);

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
  const effectiveLocalities = fetchedLocalities ?? [];
  useEffect(() => {
    if (defaultCity)    setCity(defaultCity);
    if (defaultCountry) setCountry(defaultCountry);
    if (defaultSlug)    setSelectedSlug(defaultSlug);
    if (defaultSlug)    setSearchCitySlug(defaultSlug);
  }, [defaultCity, defaultCountry, defaultSlug]);

  useEffect(() => {
    const img = new window.Image();
    img.src = HOTELS_BANNER_IMAGE;
    if (img.complete) { setBannerLoaded(true); return; }
    img.onload  = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

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
    if (!trimmedCity)                           { setSearchError("Please enter a city or hotel location"); return; }
    if (!checkInIso)                            { setSearchError("Please select check-in date");           return; }
    if (!checkOutIso || checkOutIso <= checkInIso) { setSearchError("Check-out must be after check-in");  return; }

    const localQuery = trimmedCity.toLowerCase();
    // A city can also be part of a locality name (for example, "Manali" is
    // contained in "Old Manali"). Resolve an exact city before attempting a
    // fuzzy locality match so selecting or searching a city never adds an
    // unrelated area filter to the results URL.
    const isExactDestination =
      selectedSlug === slugifyCityName(trimmedCity) ||
      effectiveDestinations.some(
        (item) =>
          item.city.toLowerCase() === localQuery ||
          item.slug === slugifyCityName(trimmedCity),
      );
    const locality =
      effectiveLocalities.find(
        (item) =>
          item.slug === slugifyCityName(trimmedCity) ||
          item.name.toLowerCase() === localQuery ||
          `${item.name} ${item.city}`.toLowerCase() === localQuery,
      ) ?? (isExactDestination ? null : findHotelLocality(trimmedCity));
    const matched = matchHotelDestinationFromList(locality?.city ?? trimmedCity, effectiveDestinations);
    const slug    = selectedSlug || locality?.citySlug || matched?.slug || searchCitySlug || slugifyCityName(trimmedCity);
    const q       = searchLocation.trim() || locality?.name || (!matched && selectedSlug ? trimmedCity : undefined);

    if (matched && !selectedSlug) {
      setSelectedSlug(matched.slug);
      setSearchCitySlug(matched.slug);
      setCountry(matched.country);
    }

    const sort: HotelSortOption | undefined = undefined;
    setIsSearching(true);
    router.push(hotelResultsHref(slug, { check_in: checkInIso, check_out: checkOutIso, rooms, guests, q, sort }));
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
            position.coords.latitude, position.coords.longitude,
          );
          const match = matchHotelDestinationFromList(resolvedCity, effectiveDestinations);
          if (match) { setCity(match.city); setCountry(match.country); setSelectedSlug(match.slug); setSearchCitySlug(match.slug); setSearchLocation(""); }
          else        { setCity(resolvedCity); setCountry(resolvedCountry); setSelectedSlug(""); setSearchCitySlug(""); setSearchLocation(resolvedCity); }
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
        if (error.code === error.PERMISSION_DENIED)      setNearMeError("Allow location access to use Near Me");
        else if (error.code === error.TIMEOUT)           setNearMeError("Location timed out. Try again.");
        else                                             setNearMeError("Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <section
      id="hotel-search"
      className={cn(
        "relative isolate w-full overflow-x-hidden overflow-y-visible",
        className,
      )}
    >
      {/* Full-bleed hero plane */}
      <div className="relative min-h-[72vh] w-full sm:min-h-[78vh]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={HOTELS_BANNER_IMAGE}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className={cn(
              "object-cover object-[center_35%] transition-opacity duration-700 sm:object-center",
              bannerLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setBannerLoaded(true)}
            onError={() => setBannerLoaded(true)}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,24,22,0.55)_0%,rgba(8,24,22,0.28)_38%,rgba(8,24,22,0.72)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,118,110,0.28),transparent_55%)]"
            aria-hidden
          />
        </div>

        {!bannerLoaded && (
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <HotelsHeroSkeleton className="h-full min-h-full" />
          </div>
        )}

        <div className="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-[1180px] flex-col justify-end px-4 pb-8 pt-20 sm:min-h-[78vh] sm:px-6 sm:pb-12 lg:px-8">
          <div className="max-w-2xl animate-[hotelsHeroIn_0.7s_ease-out_both]">
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-[#99f6e4] sm:text-sm">
              {TRAVEL_HOME_BRAND.name}
            </p>
            <h1 className="mt-3 font-display text-[2.35rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
              Stays that feel like the trip
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-lg">
              Clear prices, real rooms, and destinations you actually want to wake up in.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 animate-[hotelsHeroIn_0.85s_ease-out_both] sm:mt-10">
            {QUICK_DESTINATIONS.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  router.push(
                    hotelResultsHref(item.slug, {
                      check_in: checkInIso,
                      check_out: checkOutIso,
                      rooms,
                      guests,
                    }),
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <MapPin className="h-3.5 w-3.5 text-[#99f6e4]" aria-hidden />
                {item.city}
              </button>
            ))}
            <a
              href="#popular-destinations"
              className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-transparent px-3.5 py-2 text-[12px] font-semibold text-white/90 transition hover:bg-white/10"
            >
              All destinations
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Search dock — interaction surface under the hero plane */}
      <div className="relative z-20 -mt-6 px-3 sm:-mt-10 sm:px-6 lg:px-8">
        <form
          className="relative mx-auto w-full max-w-[1180px] overflow-visible rounded-2xl border border-[#e6eeec] bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,118,110,0.45)] backdrop-blur-md"
          role="search"
          aria-busy={isSearching}
          onSubmit={(e) => { e.preventDefault(); if (!isSearching) handleSearch(); }}
        >
          {isSearching && <HotelSearchLoadingOverlay />}
          <div className={cn(
            "flex w-full flex-col overflow-visible lg:flex-row lg:items-stretch",
            isSearching && "pointer-events-none select-none opacity-60",
          )}>
            <div className="flex min-w-0 flex-1 flex-col divide-y divide-[#eef4f2] overflow-visible lg:flex-row lg:divide-x lg:divide-y-0">
              <HotelLocationField
                className="min-w-0 flex-1"
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
              <HeroDateRangeField
                className="min-w-0 flex-[0.9]"
                checkInIso={checkInIso}
                checkOutIso={checkOutIso}
                todayIso={localDateInputString(today)}
                onChange={handleDateRangeChange}
              />
              <HotelRoomsGuestsField
                className="min-w-0 flex-[0.75]"
                rooms={rooms}
                guests={guests}
                onRoomsChange={setRooms}
                onGuestsChange={setGuests}
                childrenAges={childrenAges}
                onChildrenAgesChange={setChildrenAges}
              />
            </div>

            <div className="flex items-center p-3 sm:p-4">
              <button
                type="submit"
                disabled={isSearching}
                className="flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-6 text-[14px] font-extrabold text-white transition hover:bg-[#0d9488] disabled:cursor-wait disabled:opacity-80 lg:w-auto lg:min-w-[168px]"
              >
                <Search className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                {isSearching ? "Searching…" : "Search"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes hotelsHeroIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
