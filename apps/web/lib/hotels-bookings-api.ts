/**
 * Hotel bookings — KBC public hold / pay / confirm (no Unotrips).
 */

import {
  confirmBooking,
  createHold,
  createPayOrder,
  getBooking,
  verifyPayOrder,
  type BookingView,
  type HoldResult,
} from "@/lib/booking-api";
import type { UserBooking } from "@/lib/hotels-account-api";
import { cancelGuestBooking, getGuestBooking } from "@/lib/booking-api";

export type GuestInfoPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code?: string;
  special_requests?: string | null;
};

export type CreateBookingPayload = {
  /** Property slug for KBC public APIs. */
  property_slug: string;
  hotel_id?: string;
  room_type_id: string;
  rate_plan_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children?: number;
  children_ages?: number[];
  rooms?: number;
  guest: GuestInfoPayload;
  payment_method_nonce?: string | null;
  payment_plan?: "full" | "advance_40" | "pay_at_hotel";
  meal_plan?: string | null;
  meal_plan_label?: string | null;
  meal_plan_price?: number;
};

export type BookingWithOrder = UserBooking & {
  razorpay_order_id?: string | null;
  razorpay_key_id?: string | null;
  guest_checkout_token?: string | null;
  guest?: GuestInfoPayload;
  amount_breakdown?: {
    room_total?: number;
    taxes?: number;
    meal_plan_total?: number;
    discount?: number;
    grand_total?: number;
  };
  /** True when KBC has no Razorpay keys — use confirm instead of Checkout. */
  kbc_confirm_without_razorpay?: boolean;
  property_slug?: string;
};

export function isIncompleteBookingStatus(status: string): boolean {
  const s = (status || "pending").toLowerCase().trim();
  if (!s) return true;
  if (isConfirmedBookingStatus(s)) return false;
  if (s === "cancelled" || s === "canceled" || s === "failed" || s === "refunded") {
    return false;
  }
  return (
    s === "pending" ||
    s === "held" ||
    s === "quote" ||
    s === "payment_pending" ||
    s === "awaiting_payment" ||
    s === "created" ||
    s === "unpaid" ||
    s.includes("pending") ||
    s.includes("payment")
  );
}

export function isConfirmedBookingStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "confirmed" || s === "completed" || s === "paid";
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T12:00:00`);
  const b = new Date(`${checkOut}T12:00:00`);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function mapBookingView(
  view: BookingView,
  slug: string,
  guest?: GuestInfoPayload,
): BookingWithOrder {
  const totalInr = Math.round((view.totalMinor ?? 0) / 100);
  const taxesInr = Math.round((view.breakdown?.taxMinor ?? 0) / 100);
  const roomInr = Math.round((view.breakdown?.roomSubtotalMinor ?? 0) / 100);
  return {
    id: view.id,
    confirmation_number: view.reference,
    status: view.status,
    hotel_id: view.property?.slug ?? slug,
    hotel_slug: view.property?.slug ?? slug,
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
    guest: guest
      ? {
          first_name: guest.first_name,
          last_name: guest.last_name,
          email: guest.email,
          phone: guest.phone,
          special_requests: guest.special_requests,
        }
      : {
          first_name: view.guestName?.split(" ")[0] ?? "",
          last_name: view.guestName?.split(" ").slice(1).join(" ") ?? "",
          email: "",
          phone: null,
        },
    amount_breakdown: {
      room_charges: roomInr,
      meal_charges: 0,
      child_charges: 0,
      taxes: taxesInr,
      discount: Math.round((view.breakdown?.couponDiscountMinor ?? 0) / 100),
      grand_total: totalInr,
      room_total: roomInr,
      meal_plan_total: 0,
    },
    total_amount: totalInr,
    property_slug: slug,
  } as BookingWithOrder;
}

function mapHold(
  hold: HoldResult,
  slug: string,
  payload: CreateBookingPayload,
  extras: Partial<BookingWithOrder> = {},
): BookingWithOrder {
  const totalInr = Math.round(hold.totalMinor / 100);
  return {
    id: hold.bookingId,
    confirmation_number: hold.reference,
    status: "held",
    hotel_id: payload.hotel_id ?? slug,
    hotel_slug: slug,
    hotel_name: "",
    hotel_city: "",
    hotel_thumbnail: "",
    room_type_id: payload.room_type_id,
    room_name: hold.roomType,
    check_in: hold.checkIn,
    check_out: hold.checkOut,
    nights: nightsBetween(hold.checkIn, hold.checkOut),
    adults: payload.adults,
    children: payload.children ?? 0,
    children_ages: payload.children_ages,
    rooms: payload.rooms ?? 1,
    guest: {
      first_name: payload.guest.first_name,
      last_name: payload.guest.last_name,
      email: payload.guest.email,
      phone: payload.guest.phone,
      special_requests: payload.guest.special_requests,
    },
    amount_breakdown: {
      room_charges: totalInr,
      meal_charges: 0,
      child_charges: 0,
      taxes: 0,
      discount: 0,
      grand_total: totalInr,
      room_total: totalInr,
    },
    total_amount: totalInr,
    property_slug: slug,
    ...extras,
  } as BookingWithOrder;
}

export async function fetchHotelBookingById(
  accessToken: string,
  bookingId: string,
  propertySlug?: string,
): Promise<BookingWithOrder> {
  if (propertySlug) {
    const view = await getBooking(propertySlug, bookingId);
    if (!view) throw new Error("Booking not found");
    return mapBookingView(view, propertySlug);
  }
  const view = await getGuestBooking(accessToken, bookingId);
  if (!view) throw new Error("Booking not found");
  return mapBookingView(view, view.property?.slug ?? "");
}

export async function createHotelBooking(
  accessToken: string | null | undefined,
  payload: CreateBookingPayload,
  _extraHeaders?: Record<string, string>,
): Promise<BookingWithOrder> {
  const slug = payload.property_slug?.trim();
  if (!slug) throw new Error("Property slug is required for booking.");
  if (!payload.rate_plan_id?.trim()) {
    throw new Error("Rate plan is required. Pick a room rate and try again.");
  }

  const hold = await createHold(
    slug,
    {
      roomTypeId: payload.room_type_id,
      ratePlanId: payload.rate_plan_id,
      checkIn: payload.check_in,
      checkOut: payload.check_out,
      adults: payload.adults,
      children: payload.children ?? 0,
      firstName: payload.guest.first_name,
      lastName: payload.guest.last_name,
      email: payload.guest.email,
      phone: payload.guest.phone,
    },
    accessToken,
  );

  if (payload.payment_plan === "pay_at_hotel") {
    const confirmed = await confirmBooking(slug, hold.bookingId);
    return mapHold(hold, slug, payload, {
      status: confirmed.status || "confirmed",
      confirmation_number: confirmed.reference || hold.reference,
      kbc_confirm_without_razorpay: true,
    });
  }

  try {
    const session = await createPayOrder(slug, hold.bookingId);
    if (session.alreadyConfirmed) {
      return mapHold(hold, slug, payload, { status: "confirmed" });
    }
    if (session.mock || !session.orderId || !session.keyId) {
      // No real KBC Razorpay keys — confirm without charge.
      const confirmed = await confirmBooking(slug, hold.bookingId);
      return mapHold(hold, slug, payload, {
        status: confirmed.status || "confirmed",
        confirmation_number: confirmed.reference || hold.reference,
        kbc_confirm_without_razorpay: true,
      });
    }
    return mapHold(hold, slug, payload, {
      razorpay_order_id: session.orderId,
      razorpay_key_id: session.keyId,
      kbc_confirm_without_razorpay: false,
    });
  } catch {
    // Pay order failed (e.g. confirm-only mode) — hold stays; UI can confirm.
    return mapHold(hold, slug, payload, { kbc_confirm_without_razorpay: true });
  }
}

export async function confirmHotelBookingWithoutPayment(
  propertySlug: string,
  bookingId: string,
): Promise<BookingWithOrder> {
  const confirmed = await confirmBooking(propertySlug, bookingId);
  const view = await getBooking(propertySlug, bookingId);
  if (view) {
    return mapBookingView(view, propertySlug);
  }
  return {
    id: confirmed.id,
    confirmation_number: confirmed.reference,
    status: confirmed.status,
    hotel_id: propertySlug,
    hotel_slug: propertySlug,
    hotel_name: "",
    hotel_city: "",
    hotel_thumbnail: "",
    room_type_id: "",
    room_name: "",
    check_in: "",
    check_out: "",
    nights: 1,
    adults: 2,
    children: 0,
    rooms: 1,
    total_amount: 0,
    property_slug: propertySlug,
    kbc_confirm_without_razorpay: true,
  } as BookingWithOrder;
}

export async function verifyHotelBookingPayment(
  _accessToken: string | null | undefined,
  bookingId: string,
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  propertySlug?: string,
): Promise<Record<string, unknown>> {
  const slug = propertySlug?.trim();
  if (!slug) throw new Error("Property slug is required to verify payment.");
  const result = await verifyPayOrder(slug, {
    bookingId,
    razorpayOrderId: payload.razorpay_order_id,
    razorpayPaymentId: payload.razorpay_payment_id,
    razorpaySignature: payload.razorpay_signature,
  });
  return result as unknown as Record<string, unknown>;
}

export async function cancelHotelBooking(
  accessToken: string,
  bookingId: string,
): Promise<UserBooking> {
  const result = await cancelGuestBooking(accessToken, bookingId);
  return {
    id: result.bookingId,
    confirmation_number: result.reference,
    status: "cancelled",
    hotel_id: "",
    hotel_name: "",
    hotel_city: "",
    hotel_thumbnail: "",
    room_type_id: "",
    room_name: "",
    check_in: "",
    check_out: "",
    nights: 0,
    adults: 0,
    children: 0,
    rooms: 0,
    total_amount: 0,
  } as UserBooking;
}
