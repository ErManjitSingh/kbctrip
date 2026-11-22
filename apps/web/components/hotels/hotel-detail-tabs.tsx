"use client";

import { BedDouble, FileText, Info, MapPin, Sparkles } from "lucide-react";
import { HotelDetailAbout } from "@/components/hotels/hotel-detail-about";
import { HotelDetailAmenitiesGrid } from "@/components/hotels/hotel-detail-amenities-grid";
import { HotelDetailBookingPolicy } from "@/components/hotels/hotel-detail-booking-policy";
import { HotelDetailLocation } from "@/components/hotels/hotel-detail-location";
import { HotelDetailRoomsTable, type RoomSelection } from "@/components/hotels/hotel-detail-rooms-table";
import type {
  HotelBookingQueryParams,
  HotelCity,
  HotelListing,
  HotelPhotoCategory,
  HotelRoomType,
} from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type HotelDetailTabId =
  | "rooms"
  | "overview"
  | "amenities"
  | "location"
  | "policy";

const TABS: { id: HotelDetailTabId; label: string; icon: LucideIcon }[] = [
  { id: "rooms",    label: "Rooms",          icon: BedDouble  },
  { id: "overview", label: "Overview",       icon: Info       },
  { id: "amenities",label: "Amenities",      icon: Sparkles   },
  { id: "location", label: "Location",       icon: MapPin     },
  { id: "policy",   label: "Booking Policy", icon: FileText   },
];

type HotelDetailTabsProps = {
  hotel: HotelListing;
  city: HotelCity;
  roomTypes?: HotelRoomType[];
  bookingContext?: HotelBookingQueryParams;
  policies?: string[];
  nearbyAttractions?: string[];
  photoCategories?: HotelPhotoCategory[];
  className?: string;
  activeTab: HotelDetailTabId;
  onTabChange: (tab: HotelDetailTabId) => void;
  onRoomPhotoClick?: (imageSrc: string) => void;
  onRoomSelect?: (selection: RoomSelection | null) => void;
};

export function HotelDetailTabs({
  hotel,
  city,
  roomTypes,
  bookingContext,
  policies,
  nearbyAttractions,
  photoCategories,
  activeTab,
  onTabChange,
  onRoomPhotoClick,
  onRoomSelect,
  className,
}: HotelDetailTabsProps) {
  return (
    <div id="hotel-tabs" className={cn("scroll-mt-24", className)}>
      <div className="overflow-x-auto rounded-t-2xl border border-b-0 border-[#e6eeec] bg-[#f8fbfa] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max px-3 pt-1 sm:px-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-colors sm:px-5 sm:py-4 sm:text-sm",
                  activeTab === tab.id
                    ? "border-[#0f766e] font-semibold text-[#0f766e]"
                    : "border-transparent text-[#7b8491] hover:text-[#0f766e]",
                )}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={activeTab === tab.id ? 2 : 1.5} aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-b-2xl border border-t-0 border-[#e6eeec] bg-white">
        {activeTab === "rooms" ? (
          <HotelDetailRoomsTable
            city={city}
            hotel={hotel}
            roomTypes={roomTypes}
            bookingContext={bookingContext}
            onRoomPhotoClick={onRoomPhotoClick}
            onRoomSelect={onRoomSelect}
            className="rounded-none border-0 shadow-none"
          />
        ) : null}
        {activeTab === "overview" ? (
          <HotelDetailAbout hotel={hotel} city={city} photoCategories={photoCategories} />
        ) : null}
        {activeTab === "amenities" ? (
          <HotelDetailAmenitiesGrid hotel={hotel} roomTypes={roomTypes} />
        ) : null}
        {activeTab === "policy" ? (
          <HotelDetailBookingPolicy
            hotel={hotel}
            policies={policies}
            className="rounded-none border-0 shadow-none"
          />
        ) : null}
        {activeTab === "location" ? (
          <HotelDetailLocation hotel={hotel} city={city} nearbyAttractions={nearbyAttractions} />
        ) : null}
      </div>
    </div>
  );
}
