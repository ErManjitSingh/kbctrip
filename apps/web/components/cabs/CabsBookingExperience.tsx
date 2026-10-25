"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { DayPicker } from "react-day-picker";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  SwitchCamera,
  UserRoundCheck,
} from "lucide-react";
import {
  estimateCabRoute,
  searchCabLocations,
  type CabLocation,
  type CabRouteEstimate,
} from "@/lib/cabs-location-api";
import { useAuthOptional } from "@/contexts/auth-context";
import { createCabTripRequest } from "@/lib/cab-quote-api";
import { BookingAuthModal } from "@/components/hotels/booking-auth-modal";
import { SiteFooter } from "@/components/SiteFooter";
import { TravellerQuoteRequestsStrip } from "@/components/cabs/TravellerQuoteRequestsStrip";
import { CabsPageStages } from "@/components/cabs/CabsPageStages";
import "./cabs-stage.css";
import { trackEvent, trackOnce } from "@/lib/marketing-tracking";

type RideType = "hourly" | "airport" | "outstation";
type ScheduleMode = "now" | "schedule";
type OutstationDirection = "one_way" | "round_trip";

const PARTNER_QUOTES = [
  { id: "economy", name: "Economy sedan", partner: "Verified partner", response: "Quote expected in 10–15 min", fare: "From ₹1,450", seats: "AC sedan · 4 seats" },
  { id: "comfort", name: "Comfort SUV", partner: "Verified partner", response: "Quote expected in 15–20 min", fare: "From ₹1,950", seats: "SUV · 6 seats" },
  { id: "premium", name: "Premium traveller", partner: "Verified partner", response: "Quote expected in 20–30 min", fare: "From ₹2,600", seats: "Tempo traveller · 9 seats" },
];

const RIDE_TYPES: { value: RideType; label: string; detail: string }[] = [
  { value: "outstation", label: "Outstation", detail: "Round trip or one-way" },
  { value: "hourly", label: "Hourly rental", detail: "Flexible local travel" },
  { value: "airport", label: "Airport transfer", detail: "Pickup or drop" },
];

/** Matches partner cab categories travellers can prefer (max 8 on API). Lifestyle covers, not white cutouts. */
const VEHICLE_CATEGORY_OPTIONS = [
  { value: "hatchback", label: "Hatchback", image: "/images/cabs/uno-cabs-traveller-pickup-v2.png", seats: "4 seats" },
  { value: "sedan", label: "Sedan", image: "/images/cabs/fleet-hero.png", seats: "4 seats" },
  { value: "suv", label: "SUV", image: "/images/cabs/uno-cabs-partner-fleet-v2.png", seats: "6 seats" },
  { value: "innova", label: "Innova", image: "/images/cabs/cars-banner-cropped.png", seats: "7 seats" },
  { value: "tempo_traveller", label: "Tempo traveller", image: "/reference/destination-backgrounds/manali-bg.png", seats: "12 seats" },
  { value: "mini_bus", label: "Mini bus", image: "/reference/destination-backgrounds/jaipur-bg.png", seats: "18 seats" },
  { value: "bus", label: "Bus", image: "/reference/destination-backgrounds/goa-bg.png", seats: "30+ seats" },
  { value: "luxury", label: "Luxury", image: "/reference/destination-backgrounds/kashmir-bg.png", seats: "4 seats" },
] as const;

const INITIAL_CAB_TYPES_VISIBLE = 4;

/** Table uses table-fixed so the month grid fills the popover (flex on <tr> is ignored). */
const CAB_DAY_PICKER_CLASSNAMES = {
  root: "relative w-full",
  months: "w-full",
  month: "w-full space-y-3",
  month_caption: "relative flex h-8 items-center justify-center",
  caption_label: "text-sm font-extrabold text-[#302934]",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous: "grid h-8 w-8 place-items-center rounded-lg text-[#665d65] transition hover:bg-teal-50",
  button_next: "grid h-8 w-8 place-items-center rounded-lg text-[#665d65] transition hover:bg-teal-50",
  chevron: "h-4 w-4",
  month_grid: "w-full table-fixed border-collapse",
  weekdays: "border-b border-teal-50",
  weekday: "h-8 w-[14.285%] p-0 text-center text-[10px] font-bold text-[#a0969e]",
  week: "h-10",
  day: "h-10 w-[14.285%] p-0 text-center align-middle",
  day_button: "mx-auto grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold text-[#514953] transition hover:bg-teal-50",
  selected: "[&>button]:bg-[#0f766e] [&>button]:text-white [&>button]:shadow-sm [&>button]:hover:bg-[#0d9488]",
  today: "[&>button]:font-black [&>button]:text-[#0f766e]",
  disabled: "[&>button]:cursor-not-allowed [&>button]:text-[#d8d1d4] [&>button]:hover:bg-transparent",
  outside: "[&>button]:text-[#c9c2c6]",
} as const;

/** Anchored under the date field (not a fixed bottom sheet). */
const CAB_DATE_POPOVER_CLASS =
  "absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-[#eaded6] bg-white p-3 shadow-[0_20px_45px_-20px_rgba(12,18,16,0.45)]";

function parseDateValue(value: string) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toTimeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Scheduled rides can start from 30 minutes ahead (soft lead for partners). */
const SCHEDULE_LEAD_MS = 30 * 60 * 1000;

function earliestScheduleAt(from = new Date()) {
  return new Date(from.getTime() + SCHEDULE_LEAD_MS);
}

/** Default slot: round up to the next 15 minutes after the 30-min lead. */
function earliestScheduleSlot(from = new Date()) {
  const date = earliestScheduleAt(from);
  const minutes = date.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  if (rounded === 60) {
    date.setHours(date.getHours() + 1, 0, 0, 0);
  } else {
    date.setMinutes(rounded, 0, 0);
  }
  return {
    date: toDateValue(date),
    time: toTimeValue(date),
    at: date,
  };
}

/** Product rule: "Schedule ride" is always for next day 09:00 AM only. */
function tomorrowNineSlot(from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return {
    date: toDateValue(date),
    time: toTimeValue(date),
    at: date,
  };
}

function combineDateTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return null;
  return new Date(`${dateValue}T${timeValue}:00`);
}

function isScheduleAtLeast24h(dateValue: string, timeValue: string, from = new Date()) {
  const at = combineDateTime(dateValue, timeValue);
  if (!at) return false;
  return at.getTime() >= earliestScheduleAt(from).getTime();
}

function displayDate(value: string) {
  if (!value) return "Select date";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parseDateValue(value));
}

export function CabsBookingExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHomepageQuoteFlow = searchParams.get("from_home") === "1";
  const auth = useAuthOptional();
  const [rideType, setRideType] = useState<RideType>("outstation");
  const [outstationDirection, setOutstationDirection] = useState<OutstationDirection>("one_way");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("schedule");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [pickupLocation, setPickupLocation] = useState<CabLocation | null>(null);
  const [dropLocation, setDropLocation] = useState<CabLocation | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<CabLocation[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<CabLocation[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [routeEstimate, setRouteEstimate] = useState<CabRouteEstimate | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("18:00");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedCab, setSelectedCab] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<"quotes" | "signin">("signin");
  const [postingRequest, setPostingRequest] = useState(false);
  /** Mobile wizard: 0 route → 1 when/travellers → 2 preferences + submit */
  const [mobileStep, setMobileStep] = useState(() => isHomepageQuoteFlow ? 1 : 0);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [showAllCabTypes, setShowAllCabTypes] = useState(false);
  const pendingQuoteSubmitRef = useRef(false);

  useEffect(() => {
    if (!isHomepageQuoteFlow) return;
    try {
      const raw = localStorage.getItem("uno_cabs_home_handoff");
      if (!raw) return;
      const handoff = JSON.parse(raw) as {
        pickup?: CabLocation;
        drop?: CabLocation;
        date?: string;
        time?: string;
        passengers?: number;
      };
      if (!handoff.pickup || !handoff.drop) return;
      setPickup(handoff.pickup.label);
      setDrop(handoff.drop.label);
      setPickupLocation(handoff.pickup);
      setDropLocation(handoff.drop);
      if (handoff.date) setTravelDate(handoff.date);
      if (handoff.time) setTravelTime(handoff.time);
      if (handoff.passengers) setTravellers(Math.max(1, handoff.passengers));
      setScheduleMode("schedule");
      setMobileStep(1);
      localStorage.removeItem("uno_cabs_home_handoff");
    } catch {
      // The normal route-entry step remains available when the handoff is unavailable.
    }
  }, [isHomepageQuoteFlow]);

  useEffect(() => {
    const pickupFromHome = searchParams.get("pickup")?.trim();
    const dropFromHome = searchParams.get("drop")?.trim();
    const dateFromHome = searchParams.get("date")?.trim();
    const timeFromHome = searchParams.get("time")?.trim();

    if (pickupFromHome) setPickup(pickupFromHome);
    if (dropFromHome) setDrop(dropFromHome);
    if (dateFromHome && /^\d{4}-\d{2}-\d{2}$/.test(dateFromHome)) {
      setTravelDate(dateFromHome);
      setScheduleMode("schedule");
    }
    if (timeFromHome && /^\d{2}:\d{2}$/.test(timeFromHome)) setTravelTime(timeFromHome);
  }, [searchParams]);

  useEffect(() => {
    const nextSlot = scheduleMode === "schedule" ? tomorrowNineSlot() : earliestScheduleSlot();
    setTravelDate((current) => current || nextSlot.date);
    setTravelTime((current) => current || nextSlot.time);
    setReturnDate((current) => current || nextSlot.date);
  }, []);

  const earliestSlot = useMemo(() => earliestScheduleSlot(), [
    // Refresh lead boundary roughly when the schedule UI is open / date changes
    scheduleMode, travelDate,
  ]);
  const earliestScheduleDate = earliestSlot.date;
  const earliestScheduleTimeOnMinDay = earliestSlot.time;

  const isRoundTrip = rideType === "outstation" && outstationDirection === "round_trip";
  const pickupAtPreview = scheduleMode === "now"
    ? new Date(Date.now() + 20 * 60 * 1000)
    : travelDate && travelTime
      ? combineDateTime(travelDate, travelTime)
      : null;
  const returnAtPreview = isRoundTrip && returnDate && returnTime
    ? combineDateTime(returnDate, returnTime)
    : null;
  const returnIsValid = !isRoundTrip || Boolean(
    returnAtPreview && pickupAtPreview && returnAtPreview.getTime() > pickupAtPreview.getTime(),
  );
  const scheduleIsValid = scheduleMode === "now" || isScheduleAtLeast24h(travelDate, travelTime);
  const canSubmit = Boolean(
    pickupLocation
    && (rideType === "hourly" || dropLocation)
    && (scheduleMode === "now" || (travelDate && travelTime && scheduleIsValid))
    && (!isRoundTrip || (returnDate && returnTime && returnIsValid)),
  );
  // Keep the first interaction focused: choose a route before exposing trip details.
  // Auth is deferred until "Get free quotes" — guests can fill the full form first.
  const routeReady = Boolean(pickupLocation && dropLocation);
  const routeDetailsUnlocked = routeReady;

  useEffect(() => {
    if (!routeReady && !isHomepageQuoteFlow) setMobileStep(0);
  }, [isHomepageQuoteFlow, routeReady]);

  useEffect(() => {
    // Mobile UX: when advancing to Step 3 (review), reset scroll so the new panel is visible.
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile && mobileStep === 2) {
      document.getElementById("cab-booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mobileStep]);

  const summary = useMemo(() => {
    const ride = RIDE_TYPES.find((item) => item.value === rideType)?.label ?? "Hourly rental";
    const direction = rideType === "outstation"
      ? (outstationDirection === "round_trip" ? " · Round trip" : " · One-way")
      : "";
    const pickupLabel = scheduleMode === "now" ? "ASAP (~20 min)" : `${travelDate} at ${travelTime}`;
    const returnLabel = isRoundTrip && returnDate
      ? ` · Return ${returnDate} at ${returnTime}`
      : "";
    return `${ride}${direction} · ${travellers} ${travellers === 1 ? "traveller" : "travellers"} · ${pickupLabel}${returnLabel}`;
  }, [rideType, outstationDirection, isRoundTrip, scheduleMode, travelDate, travelTime, returnDate, returnTime, travellers]);

  const swapRoute = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupLocation(dropLocation);
    setDropLocation(pickupLocation);
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setSubmitted(false);
  };

  useEffect(() => {
    if (pickupLocation || pickup.trim().length < 3) {
      setPickupSuggestions([]);
      setPickupLoading(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setPickupLoading(true);
      searchCabLocations(pickup).then((places) => {
        if (active) setPickupSuggestions(places);
      }).catch(() => {
        if (active) {
          setPickupSuggestions([]);
          setLocationError("Couldn’t load location suggestions. Please try again.");
        }
      }).finally(() => {
        if (active) setPickupLoading(false);
      });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [pickup, pickupLocation]);

  useEffect(() => {
    if (dropLocation || drop.trim().length < 3) {
      setDropSuggestions([]);
      setDropLoading(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setDropLoading(true);
      searchCabLocations(drop).then((places) => {
        if (active) setDropSuggestions(places);
      }).catch(() => {
        if (active) {
          setDropSuggestions([]);
          setLocationError("Couldn’t load location suggestions. Please try again.");
        }
      }).finally(() => {
        if (active) setDropLoading(false);
      });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [drop, dropLocation]);

  useEffect(() => {
    if (!pickupLocation || !dropLocation) {
      setRouteEstimate(null);
      setRouteLoading(false);
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    setLocationError("");
    estimateCabRoute(pickupLocation, dropLocation).then((estimate) => {
      if (!cancelled) setRouteEstimate(estimate);
    }).catch(() => {
      if (!cancelled) setLocationError("Couldn’t calculate the driving distance for this route.");
    }).finally(() => {
      if (!cancelled) setRouteLoading(false);
    });
    return () => { cancelled = true; };
  }, [pickupLocation, dropLocation]);

  const useCurrentLocation = () => {
    setLocating(true);
    setError("");
    if (!navigator.geolocation) {
      setLocating(false);
      setError("Current location is not available in this browser. Enter a pickup instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = (await res.json()) as {
            city?: string;
            locality?: string;
            principalSubdivision?: string;
            countryName?: string;
          };
          const city = (data.city || data.locality || "").trim();
          if (!city) {
            setError("Could not resolve your city. Please type a pickup location.");
            setLocating(false);
            return;
          }
          const label = [city, data.principalSubdivision].filter(Boolean).join(", ");
          setPickup(label);
          setPickupLocation({
            place_id: `current:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
            label,
            locality: city,
            district: city,
            state: data.principalSubdivision || null,
            country: data.countryName || "India",
            latitude,
            longitude,
          });
        } catch {
          setError("Could not resolve your city. Please type a pickup location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("We couldn’t access your location. Enter a pickup instead.");
      },
      { timeout: 8000 },
    );
  };

  const postTripRequest = async () => {
    const accessToken = auth?.getAccessToken();
    if (!accessToken) {
      trackEvent("cab_login_prompted", { step: "trip_request", ride_type: rideType });
      setAuthModalOpen(true);
      return;
    }
    setError("");
    setSelectedCab(null);
    setPostingRequest(true);
    try {
      const pickupAt = scheduleMode === "now"
        ? new Date(Date.now() + 20 * 60 * 1000)
        : combineDateTime(travelDate, travelTime);
      if (!pickupAt) {
        setError("Choose a pickup date and time.");
        return;
      }
      if (scheduleMode === "schedule" && pickupAt.getTime() < earliestScheduleAt().getTime()) {
        setError("Scheduled pickup must be at least 30 minutes from now. Pick a later time.");
        return;
      }
      const tripType = rideType === "airport"
        ? "airport_transfer"
        : rideType === "hourly"
          ? "hourly_rental"
          : outstationDirection;
      const returnAt = tripType === "round_trip"
        ? new Date(`${returnDate}T${returnTime}:00`)
        : null;
      if (returnAt && returnAt.getTime() <= pickupAt.getTime()) {
        setError("Return date and time must be after pickup.");
        return;
      }
      const result = await createCabTripRequest(accessToken, {
        trip_type: tripType,
        pickup_address: pickupLocation?.label || pickup,
        pickup_city: pickupLocation?.locality || pickupLocation?.district || pickup,
        pickup_state: pickupLocation?.state || null,
        drop_address: dropLocation?.label || drop || pickupLocation?.label || pickup,
        drop_city: dropLocation?.locality || dropLocation?.district || drop || pickupLocation?.locality || pickup,
        drop_state: dropLocation?.state || pickupLocation?.state || null,
        pickup_at: pickupAt.toISOString(),
        passengers: travellers,
        preferred_vehicle_categories: preferredCategories,
        additional_requirements: requirements.trim() || null,
        return_at: returnAt ? returnAt.toISOString() : null,
        notify_whatsapp: notifyWhatsApp,
      });
      trackEvent("cab_trip_request_submitted", {
        request_id: result.id,
        ride_type: rideType,
        trip_type: tripType,
        passengers: travellers,
        preferred_vehicle_count: preferredCategories.length,
        notify_whatsapp: notifyWhatsApp,
      });
      try {
        sessionStorage.setItem("uno_cabs_notify_whatsapp", notifyWhatsApp ? "1" : "0");
      } catch {
        /* ignore */
      }
      try {
        const key = "uno_cabs_my_trip_requests";
        const prev = JSON.parse(sessionStorage.getItem(key) || "[]") as unknown[];
        const next = [result, ...(Array.isArray(prev) ? prev.filter((r) => (r as { id?: string }).id !== result.id) : [])].slice(0, 5);
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore cache write errors */
      }
      router.push(`/cabs/quotes?request=${encodeURIComponent(result.id)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not post your trip request. Please try again.");
    } finally {
      setPostingRequest(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setSubmitted(false);
      if (isRoundTrip && (!returnDate || !returnTime || !returnIsValid)) {
        setError("Choose a return date and time after pickup for your round trip.");
      } else if (scheduleMode === "schedule" && !scheduleIsValid) {
        setError("Scheduled pickup must be at least 30 minutes from now. Pick a later time.");
      } else if (scheduleMode === "schedule") {
        setError("Select pickup, destination, date and time to see cabs.");
      } else {
        setError("Select a pickup and destination to see cabs.");
      }
      return;
    }
    if (!auth?.getAccessToken()) {
      setError("");
      pendingQuoteSubmitRef.current = true;
      setAuthModalIntent("quotes");
      setAuthModalOpen(true);
      return;
    }
    await postTripRequest();
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] text-[#0c1210]">
      <TravellerQuoteRequestsStrip />

      <BookingAuthModal
        open={authModalOpen}
        onClose={() => {
          pendingQuoteSubmitRef.current = false;
          setAuthModalOpen(false);
        }}
        onSuccess={() => {
          const shouldPost = pendingQuoteSubmitRef.current;
          pendingQuoteSubmitRef.current = false;
          setAuthModalOpen(false);
          if (shouldPost) void postTripRequest();
        }}
        title={authModalIntent === "quotes" ? "Sign in to get your free quotes" : "Login to continue"}
        subtitle={authModalIntent === "quotes" ? "Your trip details are saved. Sign in so partners can send quotes to your account." : "Sign in to manage your trips and bookings"}
        footerNote={authModalIntent === "quotes" ? "Sign in or sign up to post this request." : "Sign in or sign up to continue."}
      />

      <main className="flex flex-col">
        <section className="kbc-cab-hero-stage relative order-1 overflow-hidden text-white">
          <div className="kbc-cab-frame kbc-cab-band" aria-hidden="true">
            <Image
              src="/images/cabs/uno-cabs-traveller-pickup-v2.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0c1210]/75" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[1120px] px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9ae8dc]">Private cabs</p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(44px,5.4vw,72px)] font-bold leading-[0.96] tracking-[-0.05em]">Where are you going?</h1>
            <p className="mt-5 max-w-md text-[16px] leading-7 text-white/68">Airport, city, or a longer road. Post it once. Approved partners send the fare.</p>
            <form id="cab-booking-form" noValidate onFocus={() => trackOnce("cab_trip_form_started", "cab_trip_form_started", { ride_type: rideType })} onSubmit={submit} className="relative mt-10 flex w-full flex-col rounded-[28px] bg-white p-4 text-[#0c1210] shadow-[0_30px_80px_-36px_rgba(0,0,0,0.65)] sm:p-6">
              <div className={`order-0 mb-3 md:hidden ${mobileStep === 0 ? "hidden" : ""}`}>
                <h2 className="text-[20px] font-bold tracking-[-0.03em] text-[#0c1210]">
                  {mobileStep === 0 && "Where are you going?"}
                  {mobileStep === 1 && "When, and which car?"}
                  {mobileStep >= 2 && "Review the request"}
                </h2>
                <p className="mt-1 text-sm text-[#5c6562]">
                  {mobileStep === 0 && "Pickup and drop. Sign in only when you send it."}
                  {mobileStep === 1 && "Time, passengers, and the kind of car."}
                  {mobileStep >= 2 && "Add a note if you need one, then ask for quotes."}
                </p>
              </div>

              {/* Mobile wizard progress */}
              <ol className="order-0 mb-3 grid grid-cols-3 gap-1.5 md:hidden" aria-label="Booking steps">
                {["Route", "When & cab", "Quotes"].map((label, index) => {
                  const active = mobileStep === index || (index === 2 && mobileStep >= 2);
                  const done = mobileStep > index;
                  return (
                    <li key={label} className={`rounded-lg px-2 py-1.5 text-center text-[10px] font-extrabold ${done || active ? "bg-teal-50 text-[#115e59]" : "bg-slate-50 text-slate-400"}`}>
                      {index + 1}. {label}
                    </li>
                  );
                })}
              </ol>

              {routeDetailsUnlocked && <fieldset className={`order-2 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <legend className="sr-only">Ride type</legend>
                {/* Mobile: keep all 3 ride types in one row. */}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                  {RIDE_TYPES.map(({ value, label, detail }) => (
                    <label key={value} className={`cursor-pointer rounded-xl border p-2 transition ${rideType === value ? "border-[#0f766e] bg-teal-50 text-[#115e59]" : "border-[#ebe5e2] text-[#514953] hover:border-teal-200"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        name="rideType"
                        value={value}
                        checked={rideType === value}
                        onChange={() => {
                          setRideType(value);
                          if (value !== "outstation") setOutstationDirection("one_way");
                          setSubmitted(false);
                        }}
                      />
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="hidden mt-0.5 text-[11px] leading-4 text-[#766d74] sm:block">{detail}</span>
                    </label>
                  ))}
                </div>
              </fieldset>}

              {routeDetailsUnlocked && rideType === "outstation" && (
                <fieldset className={`order-3 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                  <legend className="mb-1.5 text-sm font-bold text-[#403842]">Trip direction <span className="text-[#0f766e]">*</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${outstationDirection === "one_way" ? "border-[#0f766e] bg-teal-50 text-[#115e59]" : "border-[#ebe5e2]"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        name="outstationDirection"
                        checked={outstationDirection === "one_way"}
                        onChange={() => { setOutstationDirection("one_way"); setSubmitted(false); }}
                      />
                      One-way
                      <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Drop at destination</span>
                    </label>
                    <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${outstationDirection === "round_trip" ? "border-[#0f766e] bg-teal-50 text-[#115e59]" : "border-[#ebe5e2]"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        name="outstationDirection"
                        checked={outstationDirection === "round_trip"}
                        onChange={() => {
                          setOutstationDirection("round_trip");
                          setReturnDate((current) => current || travelDate || earliestScheduleDate);
                          setSubmitted(false);
                        }}
                      />
                      Round trip
                      <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Return to pickup</span>
                    </label>
                  </div>
                </fieldset>
              )}

              <div className={`order-1 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_220px] md:items-end ${(mobileStep > 0 || isHomepageQuoteFlow) ? "hidden" : ""}`}>
                <div>
                  <label htmlFor="cab-pickup" className="mb-1.5 block text-[13px] font-semibold text-[#3d4744]">Pickup</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f766e]" />
                    <input id="cab-pickup" value={pickup} onChange={(event) => { setPickup(event.target.value); setPickupLocation(null); setLocationError(""); setSubmitted(false); }} placeholder="City or landmark" autoComplete="off" className="h-12 w-full rounded-2xl border border-[#e4ece8] bg-[#f6faf8] pl-10 pr-11 text-[15px] outline-none transition placeholder:text-[#8b9692] focus:border-[#0c1210] focus:bg-white focus:ring-4 focus:ring-black/5" />
                    {pickupLoading ? <span role="status" aria-label="Loading pickup suggestions" className="absolute right-4 top-1/2 -translate-y-1/2"><span className="block h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-[#0f766e]" /></span> : <button type="button" onClick={useCurrentLocation} aria-label="Use current location" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#0f766e] hover:bg-teal-50 disabled:opacity-50" disabled={locating}>
                      <LocateFixed className="h-4 w-4" />
                    </button>}
                    {pickupSuggestions.length > 0 && <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-teal-100 bg-white py-1 shadow-[0_18px_36px_-18px_rgba(12,18,16,0.35)]">{pickupSuggestions.map((place) => <li key={place.place_id}><button type="button" onClick={() => { setPickup(place.label); setPickupLocation(place); setPickupSuggestions([]); setLocationError(""); setSubmitted(false); }} className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-teal-50"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" /><span><strong className="block text-sm text-[#403842]">{place.locality || place.label.split(",")[0]}</strong><small className="mt-0.5 block text-xs text-[#766d74]">{[place.district, place.state, place.country].filter(Boolean).join(", ") || place.label}</small></span></button></li>)}</ul>}
                  </div>
                </div>
                <button type="button" onClick={swapRoute} aria-label="Swap pickup and drop locations" className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-[#d7e2dd] bg-white text-[#0f766e] shadow-sm transition hover:bg-[#f3f7f5] md:mb-2">
                  <SwitchCamera className="h-3.5 w-3.5 rotate-90" />
                </button>
                <div>
                  <label htmlFor="cab-drop" className="mb-1.5 block text-[13px] font-semibold text-[#3d4744]">{rideType === "hourly" ? "Area" : "Drop"}</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f766e]" />
                    <input id="cab-drop" value={drop} onChange={(event) => { setDrop(event.target.value); setDropLocation(null); setLocationError(""); setSubmitted(false); }} placeholder="City or landmark" autoComplete="off" className="h-12 w-full rounded-2xl border border-[#e4ece8] bg-[#f6faf8] pl-10 pr-4 text-[15px] outline-none transition placeholder:text-[#8b9692] focus:border-[#0c1210] focus:bg-white focus:ring-4 focus:ring-black/5" />
                    {dropLoading && <span role="status" aria-label="Loading destination suggestions" className="absolute right-4 top-1/2 -translate-y-1/2"><span className="block h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-[#0f766e]" /></span>}
                    {dropSuggestions.length > 0 && <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-teal-100 bg-white py-1 shadow-[0_18px_36px_-18px_rgba(12,18,16,0.35)]">{dropSuggestions.map((place) => <li key={place.place_id}><button type="button" onClick={() => { setDrop(place.label); setDropLocation(place); setDropSuggestions([]); setLocationError(""); setSubmitted(false); }} className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-teal-50"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" /><span><strong className="block text-sm text-[#403842]">{place.locality || place.label.split(",")[0]}</strong><small className="mt-0.5 block text-xs text-[#766d74]">{[place.district, place.state, place.country].filter(Boolean).join(", ") || place.label}</small></span></button></li>)}</ul>}
                  </div>
                </div>
                <div className="hidden md:block">
                  {!routeReady ? (
                    <button type="submit" disabled className="flex min-h-12 w-full cursor-default items-center justify-center gap-2 rounded-full bg-[#0c1210] px-5 text-[15px] font-semibold text-white disabled:opacity-100">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={postingRequest || !canSubmit} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0c1210] px-5 text-[15px] font-semibold text-white transition hover:bg-[#1a2420] focus:outline-none focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-40">
                      {postingRequest ? "Posting…" : "Get quotes"} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="hidden text-center text-[12px] leading-5 text-[#7c8682] md:col-span-4 md:block">Nothing is booked until you choose a quote.</p>
              </div>
              {(routeLoading || routeEstimate) && <div className={`order-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 ${mobileStep > 0 ? "hidden md:flex" : ""}`}><span className="flex items-center gap-2 text-xs font-bold text-emerald-800"><MapPin className="h-4 w-4 text-emerald-600" />{routeLoading ? "Calculating driving distance…" : "Driving route ready"}</span>{routeEstimate && <strong className="text-xs text-emerald-900">{routeEstimate.distance_km.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km · about {routeEstimate.duration_minutes < 60 ? `${routeEstimate.duration_minutes} min` : `${Math.floor(routeEstimate.duration_minutes / 60)}h ${routeEstimate.duration_minutes % 60 ? `${routeEstimate.duration_minutes % 60}m` : ""}`}</strong>}</div>}

              {routeDetailsUnlocked && <>
              <section aria-label="Number of travellers" className={`order-8 mt-3 flex items-center justify-between gap-4 rounded-xl border border-[#eee3dc] bg-[#f3f7f5] px-3 py-2 sm:px-3.5 ${mobileStep !== 1 ? "hidden md:flex" : ""}`}>
                <span className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#0f766e] shadow-sm"><UserRoundCheck className="h-4 w-4" /></span><span className="flex items-baseline gap-1.5"><strong className="text-sm text-[#403842]">Travellers</strong><small className="text-xs text-[#766d74]">incl. children</small></span></span>
                <span className="flex items-center gap-1.5"><button type="button" onClick={() => setTravellers((count) => Math.max(1, count - 1))} disabled={travellers <= 1} aria-label="Remove traveller" className="grid h-11 w-11 place-items-center rounded-xl border border-[#e4dcd8] bg-white text-[#655b64] transition hover:border-teal-300 hover:text-[#0f766e] disabled:cursor-not-allowed disabled:opacity-35"><Minus className="h-4 w-4" /></button><output aria-live="polite" className="min-w-7 text-center text-sm font-extrabold text-[#302934]">{travellers}</output><button type="button" onClick={() => setTravellers((count) => Math.min(50, count + 1))} aria-label="Add traveller" className="grid h-11 w-11 place-items-center rounded-xl border border-teal-200 bg-white text-[#0f766e] transition hover:bg-teal-50"><Plus className="h-4 w-4" /></button></span>
              </section>

              <fieldset className={`order-8 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <legend className="text-sm font-bold text-[#403842]">
                  Cab type you want <span className="font-normal text-[#81777f]">(optional)</span>
                </legend>
                <p className="mt-0.5 text-xs text-[#766d74]">Pick any that work — partners match these first.</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(showAllCabTypes
                    ? VEHICLE_CATEGORY_OPTIONS
                    : VEHICLE_CATEGORY_OPTIONS.slice(0, INITIAL_CAB_TYPES_VISIBLE)
                  ).map(({ value, label, image, seats }) => {
                    const selected = preferredCategories.includes(value);
                    return (
                      <label
                        key={value}
                        className={`relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition ${
                          selected
                            ? "border-[#0f766e] ring-2 ring-teal-100"
                            : "border-[#d7e2de] hover:border-teal-200"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setPreferredCategories((current) =>
                              selected
                                ? current.filter((item) => item !== value)
                                : current.length >= 8
                                  ? current
                                  : [...current, value],
                            );
                            setSubmitted(false);
                          }}
                        />
                        <span className="relative aspect-[4/3] w-full overflow-hidden bg-[#0c1210]">
                          <Image
                            src={image}
                            alt={label}
                            fill
                            sizes="(max-width:640px) 45vw, 180px"
                            className="object-cover object-center"
                            unoptimized
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                          {selected && (
                            <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#0f766e] text-white shadow-sm">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          )}
                          <strong className="absolute bottom-2 left-2 right-2 truncate text-[12px] font-extrabold text-white drop-shadow sm:text-sm">
                            {label}
                          </strong>
                        </span>
                        <span className={`border-t px-2 py-2 text-center ${selected ? "border-teal-100 bg-teal-50/70" : "border-[#e8f0ed]"}`}>
                          <small className={`block text-[10px] font-semibold ${selected ? "text-[#115e59]" : "text-[#5c6662]"}`}>
                            {seats}
                          </small>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {VEHICLE_CATEGORY_OPTIONS.length > INITIAL_CAB_TYPES_VISIBLE && (
                  <button
                    type="button"
                    onClick={() => setShowAllCabTypes((open) => !open)}
                    className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-200 bg-teal-50/40 text-sm font-extrabold text-[#115e59] transition hover:bg-teal-50 sm:w-auto sm:px-4"
                  >
                    {showAllCabTypes
                      ? "Show less"
                      : `Show more types (+${VEHICLE_CATEGORY_OPTIONS.length - INITIAL_CAB_TYPES_VISIBLE})`}
                    <ChevronRight className={`h-4 w-4 transition ${showAllCabTypes ? "-rotate-90" : "rotate-90"}`} />
                  </button>
                )}
                {preferredCategories.length > 0 && (
                  <p className="mt-2 text-[11px] font-semibold text-[#115e59]">
                    {preferredCategories.length} selected · leave empty for any cab type
                  </p>
                )}
              </fieldset>

              <fieldset className={`order-5 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <legend className="mb-1.5 text-sm font-bold text-[#403842]">Pickup time <span className="text-[#0f766e]">*</span></legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${scheduleMode === "now" ? "border-[#0f766e] bg-teal-50 text-[#115e59]" : "border-[#ebe5e2]"}`}><input className="sr-only" type="radio" name="schedule" checked={scheduleMode === "now"} onChange={() => { setScheduleMode("now"); setSubmitted(false); }} />ASAP (~20 min) <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Soonest partner pickup</span></label>
                  <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${scheduleMode === "schedule" ? "border-[#0f766e] bg-teal-50 text-[#115e59]" : "border-[#ebe5e2]"}`}><input className="sr-only" type="radio" name="schedule" checked={scheduleMode === "schedule"} onChange={() => {
                    setScheduleMode("schedule");
                    const slot = tomorrowNineSlot();
                    setTravelDate(slot.date);
                    setTravelTime(slot.time);
                    setSubmitted(false);
                  }} />Schedule ride <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Prefilled · tomorrow 09:00 AM</span></label>
                </div>
              </fieldset>

              {scheduleMode === "schedule" && <section aria-label="Schedule your pickup" className={`order-6 mt-2 overflow-visible rounded-xl border border-teal-100 bg-teal-50/40 p-2.5 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
                  <div className="flex items-center gap-2 pb-0.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#0f766e] shadow-sm"><CalendarDays className="h-4 w-4" /></span><div><h3 className="text-sm font-extrabold text-[#403842]">Schedule pickup</h3><p className="text-[11px] text-[#766d74]">Prefilled: tomorrow 09:00 AM</p></div></div>
                  <div className="relative"><label id="cab-date-label" className="mb-1 block text-xs font-bold text-[#514953]">Date <span className="text-[#0f766e]">*</span></label><button type="button" aria-labelledby="cab-date-label" aria-haspopup="dialog" aria-expanded={calendarOpen} onClick={() => { setCalendarOpen((open) => !open); setReturnCalendarOpen(false); }} className="flex h-11 w-full items-center justify-between rounded-lg border border-[#ddd5d1] bg-white px-3 text-left text-sm font-semibold text-[#403842] outline-none transition hover:border-teal-300 focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#0f766e]" />{displayDate(travelDate)}</span><ChevronRight className={`h-4 w-4 text-[#766d74] transition ${calendarOpen ? "rotate-90" : ""}`} /></button>{calendarOpen && <div role="dialog" aria-label="Choose pickup date" className={CAB_DATE_POPOVER_CLASS}><DayPicker mode="single" animate selected={parseDateValue(travelDate || earliestScheduleDate)} disabled={{ before: parseDateValue(earliestScheduleDate) }} onSelect={(date) => { if (date) { const next = toDateValue(date); setTravelDate(next); if (next === earliestScheduleDate) { setTravelTime((current) => (!current || current < earliestScheduleTimeOnMinDay ? earliestScheduleTimeOnMinDay : current)); } if (returnDate && returnDate < next) setReturnDate(next); setCalendarOpen(false); setSubmitted(false); } }} classNames={CAB_DAY_PICKER_CLASSNAMES} /></div>}</div>
                  <div><label htmlFor="cab-time" className="mb-1 block text-xs font-bold text-[#514953]">Time <span className="text-[#0f766e]">*</span></label><div className="relative min-w-0"><Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f766e]" /><input id="cab-time" type="time" value={travelTime} min={travelDate === earliestScheduleDate ? earliestScheduleTimeOnMinDay : undefined} onChange={(event) => { const next = event.target.value; if (travelDate === earliestScheduleDate && next < earliestScheduleTimeOnMinDay) { setTravelTime(earliestScheduleTimeOnMinDay); setError("Pickup must be at least 30 minutes from now."); } else { setTravelTime(next); setError(""); } setSubmitted(false); }} className="h-11 min-w-0 w-full max-w-full overflow-hidden rounded-lg border border-[#ddd5d1] bg-white pl-9 pr-3 text-left text-sm font-semibold text-[#403842] outline-none focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100 [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0 [&::-webkit-datetime-edit]:min-w-0" /></div></div>
                </div>
                {!scheduleIsValid && (
                  <p role="status" className="mt-2 text-xs font-medium text-amber-800">
                    Pickup must be at least 30 minutes from now (earliest: {displayDate(earliestScheduleDate)} at {earliestScheduleTimeOnMinDay}).
                  </p>
                )}
              </section>}

              {isRoundTrip && (
                <section aria-label="Schedule your return" className={`order-7 mt-2 overflow-visible rounded-xl border border-teal-100 bg-teal-50/40 p-2.5 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                  <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
                    <div className="flex items-center gap-2 pb-0.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#0f766e] shadow-sm">
                        <CalendarDays className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#403842]">Return trip</h3>
                        <p className="hidden text-[11px] text-[#766d74] sm:block">When you head back</p>
                      </div>
                    </div>
                    <div className="relative">
                      <label id="cab-return-date-label" className="mb-1 block text-xs font-bold text-[#514953]">
                        Return date <span className="text-[#0f766e]">*</span>
                      </label>
                      <button
                        type="button"
                        aria-labelledby="cab-return-date-label"
                        aria-haspopup="dialog"
                        aria-expanded={returnCalendarOpen}
                        onClick={() => { setReturnCalendarOpen((open) => !open); setCalendarOpen(false); }}
                        className="flex h-10 w-full items-center justify-between rounded-lg border border-[#ddd5d1] bg-white px-3 text-left text-sm font-semibold text-[#403842] outline-none transition hover:border-teal-300 focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                      >
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#0f766e]" />
                          {displayDate(returnDate)}
                        </span>
                        <ChevronRight className={`h-4 w-4 text-[#766d74] transition ${returnCalendarOpen ? "rotate-90" : ""}`} />
                      </button>
                      {returnCalendarOpen && (
                        <div
                          role="dialog"
                          aria-label="Choose return date"
                          className={CAB_DATE_POPOVER_CLASS}
                        >
                          <DayPicker
                            mode="single"
                            animate
                            selected={parseDateValue(returnDate || travelDate || earliestScheduleDate)}
                            disabled={{ before: parseDateValue(travelDate || earliestScheduleDate) }}
                            onSelect={(date) => {
                              if (date) {
                                setReturnDate(toDateValue(date));
                                setReturnCalendarOpen(false);
                                setSubmitted(false);
                              }
                            }}
                            classNames={CAB_DAY_PICKER_CLASSNAMES}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cab-return-time" className="mb-1 block text-xs font-bold text-[#514953]">
                        Return time <span className="text-[#0f766e]">*</span>
                      </label>
                      <div className="relative min-w-0">
                        <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f766e]" />
                        <input
                          id="cab-return-time"
                          type="time"
                          value={returnTime}
                          onChange={(event) => { setReturnTime(event.target.value); setSubmitted(false); }}
                          className="h-10 min-w-0 w-full max-w-full overflow-hidden rounded-lg border border-[#ddd5d1] bg-white pl-9 pr-3 text-left text-sm font-semibold text-[#403842] outline-none focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100 [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0 [&::-webkit-datetime-edit]:min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                  {isRoundTrip && returnDate && returnTime && !returnIsValid && (
                    <p role="status" className="mt-2 text-xs font-medium text-amber-800">
                      Return must be after pickup time.
                    </p>
                  )}
                </section>
              )}

              <details className={`order-9 mt-2 rounded-xl bg-[#f3f7f5] px-3 py-2 ${mobileStep < 2 ? "hidden md:block" : ""}`} open={mobileStep >= 2 || undefined}>
                <summary className="cursor-pointer text-sm font-bold text-[#534a53]">
                  Special requirements <span className="font-normal text-[#81777f]">(optional)</span>
                </summary>

                {preferredCategories.length > 0 && (
                  <p className="mt-3 text-xs font-semibold text-[#514953]">
                    Cab types:{" "}
                    <span className="text-[#115e59]">
                      {preferredCategories
                        .map((value) => VEHICLE_CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label || value)
                        .join(", ")}
                    </span>
                  </p>
                )}

                <label htmlFor="cab-requirements" className="mt-3 block text-sm font-bold text-[#403842]">
                  Notes for partners
                </label>
                <textarea
                  id="cab-requirements"
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  rows={2}
                  placeholder="Child seat, accessibility needs, extra luggage…"
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#ddd5d1] bg-white px-3 py-2.5 text-base outline-none placeholder:text-[#9a9198] focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                />
              </details>

              {mobileStep >= 2 && (
                <label className="order-9 mt-3 flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-3 text-sm md:hidden">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="mt-0.5 h-5 w-5 accent-[#0f766e]"
                  />
                  <span>
                    <strong className="block font-extrabold text-[#403842]">Notify me on WhatsApp</strong>
                    <span className="mt-0.5 block text-xs text-[#746a73]">We’ll message you when the first partner quote arrives. You can leave this page.</span>
                  </span>
                </label>
              )}
              <label className={`order-9 mt-3 hidden items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-3 text-sm md:flex ${!routeDetailsUnlocked ? "md:hidden" : ""}`}>
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-[#0f766e]"
                />
                <span>
                  <strong className="block font-extrabold text-[#403842]">Notify me on WhatsApp when quotes arrive</strong>
                  <span className="mt-0.5 block text-xs text-[#746a73]">We’ll keep matching partners even if you leave this page. Check My quotes anytime.</span>
                </span>
              </label>
              </>}

              {locationError && <p role="status" className="order-10 mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">{locationError}</p>}
              {error && <p role="alert" className="order-11 mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}

              {/* Desktop / in-form CTAs */}
              <div className={`order-12 mt-3 hidden ${mobileStep === 0 && !isHomepageQuoteFlow ? "" : "md:block"}`}>
                {!routeReady ? (
                  <button type="submit" disabled className="flex min-h-12 w-full cursor-default items-center justify-center gap-2 rounded-full bg-[#0c1210] px-5 text-[15px] font-semibold text-white disabled:opacity-100">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={postingRequest || !canSubmit} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0c1210] px-5 text-[15px] font-semibold text-white transition hover:bg-[#1a2420] focus:outline-none focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-40">
                    {postingRequest ? "Posting your request…" : "Get free quotes"} <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                <p className="mt-2.5 text-center text-[12px] leading-5 text-[#7c8682]">Nothing is booked until you choose a quote.</p>
              </div>

              {/* Mobile wizard CTAs — inside the form card only */}
              <div className="order-12 mt-3 flex gap-2 md:hidden">
                {mobileStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setMobileStep((step) => Math.max(0, step - 1))}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e4dbd5] px-4 text-sm font-extrabold text-[#514953]"
                  >
                    Back
                  </button>
                )}
                {mobileStep === 0 && (
                  <button
                    type="button"
                    disabled={!routeReady}
                    onClick={() => setMobileStep(1)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 text-base font-extrabold text-white disabled:opacity-45"
                  >
                    Next · When <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                {mobileStep === 1 && (
                  <button
                    type="button"
                    disabled={!(scheduleMode === "now" || (travelDate && travelTime)) || (isRoundTrip && !returnIsValid)}
                    onClick={() => setMobileStep(2)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 text-base font-extrabold text-white disabled:opacity-45"
                  >
                    Next · Review <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                {mobileStep >= 2 && (
                  <button
                    type="submit"
                    disabled={postingRequest || !canSubmit}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 text-base font-extrabold text-white disabled:opacity-45"
                  >
                    {postingRequest ? "Posting…" : "Get free quotes"} <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="order-[13] mt-1.5 text-center text-xs leading-4 text-[#7c727a] md:hidden">Free request · Nothing booked until you choose a quote.</p>
            </form>
          </div>
        </section>

        {submitted && <section aria-live="polite" className="mx-auto max-w-6xl px-4 py-5 sm:px-6"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-emerald-600"><Check className="h-5 w-5" /></span><div><h2 className="font-extrabold text-emerald-950">Your request is ready to share</h2><p className="mt-0.5 text-sm text-emerald-800">{pickup} {rideType !== "hourly" ? `→ ${drop}` : `· ${drop}`} · {summary}</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-3">{PARTNER_QUOTES.map((quote) => <article key={quote.id} className={`rounded-xl border bg-white p-4 transition ${selectedCab === quote.id ? "border-emerald-500 ring-2 ring-emerald-200" : "border-emerald-100"}`}><div className="flex items-start justify-between gap-2"><div><h3 className="font-extrabold text-[#292229]">{quote.name}</h3><p className="mt-0.5 text-sm text-[#706771]">{quote.partner} · {quote.seats}</p></div><strong className="text-lg text-[#1d7a52]">{quote.fare}</strong></div><p className="mt-2 text-xs font-medium text-[#706771]">{quote.response}</p><button type="button" aria-pressed={selectedCab === quote.id} onClick={() => setSelectedCab(quote.id)} className={`mt-3 min-h-10 w-full rounded-lg text-sm font-bold transition ${selectedCab === quote.id ? "bg-emerald-600 text-white" : "border border-emerald-300 text-emerald-800 hover:bg-emerald-50"}`}>{selectedCab === quote.id ? "Quote preference saved" : "Prefer this quote"}</button></article>)}</div>{selectedCab && <p className="mt-3 text-sm font-semibold text-emerald-900">Preference saved. We&apos;ll connect you with the relevant cab partner to confirm the final quote and driver details.</p>}</div></section>}

        <CabsPageStages />
      </main>
      <SiteFooter />
    </div>
  );
}
