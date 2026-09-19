/**
 * Account API — profile & bookings via KBC guest endpoints.
 */

import {
  getGuestBookings,
  getGuestBooking,
  getGuestMe,
  updateGuestMe,
  type GuestBookingSummary,
} from "@/lib/booking-api";
import type { AuthUser } from "@/lib/hotels-auth-api";
import { ApiError } from "@/lib/api";

export type UserBooking = {
  id: string;
  confirmation_number: string;
  status: string;
  hotel_id: string;
  hotel_slug?: string;
  hotel_name: string;
  hotel_city: string;
  hotel_thumbnail: string;
  room_type_id: string;
  room_name: string;
  meal_plan?: string | null;
  meal_plan_label?: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  children_ages?: number[];
  rooms: number;
  guest?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    special_requests?: string | null;
  };
  amount_breakdown?: {
    room_charges: number;
    meal_charges: number;
    child_charges: number;
    taxes: number;
    service_fee: number;
    discount: number;
    total: number;
  };
  total_amount: number;
  currency: string;
  payment_plan?: "full" | "advance_40" | "pay_at_hotel";
  amount_paid?: number;
  balance_due_amount?: number;
  balance_due_date?: string | null;
  balance_status?: string;
  balance_payment_method?: string | null;
  created_at: string;
  updated_at: string;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T12:00:00`);
  const b = new Date(`${checkOut}T12:00:00`);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function mapGuestBooking(row: GuestBookingSummary): UserBooking {
  const now = new Date().toISOString();
  return {
    id: row.id,
    confirmation_number: row.reference,
    status: row.status,
    hotel_id: row.property.slug,
    hotel_slug: row.property.slug,
    hotel_name: row.property.name,
    hotel_city: row.property.city ?? "",
    hotel_thumbnail: "",
    room_type_id: "",
    room_name: row.roomType,
    check_in: row.checkIn,
    check_out: row.checkOut,
    nights: nightsBetween(row.checkIn, row.checkOut),
    adults: 2,
    children: 0,
    rooms: 1,
    total_amount: Math.round((row.totalMinor ?? 0) / 100),
    currency: row.property.currency || "INR",
    created_at: now,
    updated_at: now,
  };
}

function profileToAuthUser(profile: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
}): AuthUser {
  const now = new Date().toISOString();
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: null,
    role: "guest",
    is_verified: true,
    is_active: true,
    created_at: now,
    updated_at: now,
    phone_verified: Boolean(profile.phone),
    email_verified: true,
  };
}

export async function fetchUserProfile(accessToken: string): Promise<AuthUser> {
  const profile = await getGuestMe(accessToken);
  if (!profile) throw new ApiError("Session expired.", 401);
  return profileToAuthUser(profile);
}

export const fetchAccountProfile = fetchUserProfile;

export async function updateAccountProfile(
  accessToken: string,
  payload: { name?: string; phone?: string | null },
): Promise<AuthUser> {
  const profile = await updateGuestMe(accessToken, {
    name: payload.name,
    phone: payload.phone ?? undefined,
  });
  return profileToAuthUser(profile);
}

export async function fetchUserBookings(accessToken: string): Promise<UserBooking[]> {
  const data = await getGuestBookings(accessToken);
  if (!data) return [];
  return [...(data.upcoming ?? []), ...(data.past ?? [])].map(mapGuestBooking);
}

export async function fetchBookingById(accessToken: string, bookingId: string): Promise<UserBooking> {
  const view = await getGuestBooking(accessToken, bookingId);
  if (!view) throw new ApiError("Booking not found", 404);
  const now = new Date().toISOString();
  return {
    id: view.id,
    confirmation_number: view.reference,
    status: view.status,
    hotel_id: view.property?.slug ?? "",
    hotel_slug: view.property?.slug,
    hotel_name: view.property?.name ?? "",
    hotel_city: view.property?.city ?? "",
    hotel_thumbnail: "",
    room_type_id: "",
    room_name: view.roomType,
    check_in: view.checkIn,
    check_out: view.checkOut,
    nights: nightsBetween(view.checkIn, view.checkOut),
    adults: 2,
    children: 0,
    rooms: 1,
    total_amount: Math.round((view.totalMinor ?? 0) / 100),
    currency: view.property?.currency || "INR",
    created_at: now,
    updated_at: now,
  };
}

export async function changeAccountPassword(
  _accessToken: string,
  _payload: { current_password: string; new_password: string },
): Promise<{ message?: string }> {
  throw new ApiError("Password change is not available on KBC guest accounts yet.", 501);
}
