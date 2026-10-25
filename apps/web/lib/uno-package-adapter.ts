/**
 * src/lib/uno-package-adapter.ts
 * Map KBC marketplace holiday packages → Unotrips-shaped TourPackage UI models.
 * No Unotrips network calls.
 */

import type { MarketplaceHolidayPackage } from "./booking-api";
import type { TourItineraryDay, TourPackage } from "./constants";
import type { CabOption, DestinationHotels, HotelOption } from "./package-customizer-data";
import { packageCoverUrls } from "./package-cover";

export function toTourPackage(pack: MarketplaceHolidayPackage): TourPackage {
  const photos = packageCoverUrls(pack.destination, pack.photos);
  const itinerary: TourItineraryDay[] = (pack.itinerary ?? []).map((day) => ({
    day: day.day,
    title: day.title,
    body: day.summary || "",
    summary: day.summary,
    description: day.summary,
    activities: day.activities,
    stay: day.stay,
    meals: day.meals,
    transfer: day.transfer,
    driveHours: day.transfer ? "Private transfer" : undefined,
  }));

  return {
    id: pack.id,
    packageId: pack.id,
    slug: pack.slug,
    title: pack.title,
    image: photos[0]!,
    galleryImages: photos,
    durationNights: pack.nights,
    durationDays: pack.days,
    rating: 4.8,
    reviewCount: 128,
    priceINR: Math.round(pack.pricePerPersonMinor / 100),
    pricePer: "per_person",
    description: pack.description ?? undefined,
    location: pack.destination,
    departureCity: pack.departureCity ?? undefined,
    packageType: pack.category ?? "Domestic",
    itinerary,
    inclusions: pack.inclusions ?? [],
    exclusions: pack.exclusions ?? [],
    highlights: pack.highlights ?? [],
    isCustomizable: true,
    badge: pack.badge,
  };
}

/** Build hotel groups from itinerary stay labels (KBC marketplace). */
export function hotelGroupsFromTour(tour: TourPackage): DestinationHotels[] {
  const days = tour.itinerary ?? [];
  const groups: DestinationHotels[] = [];

  let current: DestinationHotels | null = null;
  for (const day of days) {
    if (!day.stay?.trim()) continue;
    const stayName = day.stay.trim();
    if (current && current.dest === stayName) {
      current.nights += 1;
      continue;
    }
    const opt: HotelOption = {
      id: `opt-${day.day}`,
      name: stayName,
      desc: day.meals?.trim() || `Comfortable stay at ${stayName}`,
      stars: 3,
      extra: 0,
      priceStatus: "confirmed",
      pop: true,
      img: tour.galleryImages?.[(day.day - 1) % (tour.galleryImages?.length || 1)] ?? tour.image,
      images: tour.galleryImages ?? [tour.image],
      address: tour.location ?? null,
      roomType: "Deluxe Room",
      mealsIncluded: day.meals ? [day.meals] : ["Breakfast"],
      checkInTime: "14:00",
      checkOutTime: "11:00",
      amenities: ["Wifi", "Room Service", "Restaurant"],
      hotelDescription: `Comfortable stay at ${stayName}.`,
      hotelId: `stay-hotel-${day.day}`,
    };
    current = {
      dest: stayName,
      nights: 1,
      stayId: `stay-${day.day}`,
      opts: [opt],
    };
    groups.push(current);
  }

  if (!groups.length && tour.durationNights > 0) {
    const name = `${tour.location?.split(",")[0]?.trim() || "Destination"} hotel`;
    groups.push({
      dest: tour.location?.split(",")[0]?.trim() || "Hotel stay",
      nights: tour.durationNights,
      stayId: "stay-1",
      opts: [
        {
          id: "opt-1",
          name,
          desc: "Handpicked hotel for this package",
          stars: 3,
          extra: 0,
          priceStatus: "confirmed",
          pop: true,
          img: tour.image,
          images: tour.galleryImages ?? [tour.image],
          address: tour.location ?? null,
          roomType: "Deluxe Room",
          mealsIncluded: ["Breakfast"],
          checkInTime: "14:00",
          checkOutTime: "11:00",
          amenities: ["Wifi", "Breakfast"],
          hotelDescription: "Handpicked hotel for this package.",
          hotelId: "stay-hotel-1",
        },
      ],
    });
  }

  return groups;
}

export function cabOptionsFromTour(tour: TourPackage): CabOption[] {
  const transferHint = (tour.itinerary ?? [])
    .map((d) => d.transfer)
    .find((t) => t?.trim());
  return [
    {
      id: "sedan",
      name: "Sedan",
      desc: transferHint?.trim() || "4 seater · AC · Private transfer",
      seats: 4,
      extra: 0,
      price: 0,
      pop: true,
      img: tour.galleryImages?.[1] ?? tour.image,
    },
    {
      id: "suv",
      name: "SUV",
      desc: "6 seater · AC · Private transfer",
      seats: 6,
      extra: 2500,
      price: 2500,
      pop: false,
      img: tour.galleryImages?.[2] ?? tour.image,
    },
  ];
}
