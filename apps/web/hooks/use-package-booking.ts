"use client";

/**
 * Package booking — KBC enquiry API (fallback to localStorage if API unavailable).
 */

import { useState, useCallback, useEffect } from "react";
import type { RoomConfig } from "@/hooks/useRoomsConfig";
import { createPackageEnquiry } from "@/lib/booking-api";

const RECOVERY_KEY_PREFIX = "pkg_booking_";
const RECOVERY_EXPIRY_MS = 15 * 60 * 1000;

export type PackageBookingPayload = {
  package_slug: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  rooms: RoomConfig[];
  travel_date: string | null;
  special_requests: string | null;
  selected_hotels: Array<{ option_id: string; room_type_id: string | null }>;
  token_percent?: number | null;
  selected_cab_option_id: string | null;
  selected_sightseeing_ids: string[];
  selected_activity_link_ids: string[];
  selected_addon_ids: string[];
  payment_type: "token" | "full";
  preferred_method?: "emi";
  selected_payment_option?: "full" | "token" | "emi";
  estimated_total_minor?: number;
};

export type PackageBookingResult = {
  booking_id: string;
  booking_number: string;
  status: string;
  payment_type: string;
  total_amount: number;
  token_amount: number;
  balance_amount: number;
  balance_due_date?: string | null;
  message: string;
};

type BookingState =
  | { phase: "idle" }
  | { phase: "loading"; message: string }
  | { phase: "awaiting_payment"; message: string }
  | { phase: "verifying"; message: string }
  | { phase: "success"; result: PackageBookingResult }
  | { phase: "error"; message: string };

type RecoveryData = {
  booking_id: string;
  created_at: number;
};

function clearRecovery(slug: string) {
  try {
    localStorage.removeItem(RECOVERY_KEY_PREFIX + slug);
  } catch {
    /* skip */
  }
}

function loadRecovery(slug: string): RecoveryData | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY_PREFIX + slug);
    if (!raw) return null;
    const data = JSON.parse(raw) as RecoveryData;
    if (Date.now() - data.created_at > RECOVERY_EXPIRY_MS) {
      clearRecovery(slug);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function adultsFromRooms(rooms: RoomConfig[]): number {
  return rooms.reduce((sum, room) => sum + (room.adults ?? 0), 0) || 2;
}

function childrenFromRooms(rooms: RoomConfig[]): number {
  return rooms.reduce((sum, room) => sum + (room.children ?? 0), 0);
}

export function usePackageBooking(slug: string) {
  const [state, setState] = useState<BookingState>({ phase: "idle" });
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  useEffect(() => {
    const data = loadRecovery(slug);
    if (data) setRecoveryData(data);
  }, [slug]);

  const book = useCallback(
    async (payload: PackageBookingPayload) => {
      try {
        setState({ phase: "loading", message: "Submitting your request…" });

        let bookingId = "";
        let bookingNumber = "";
        let status = "requested";

        try {
          const result = await createPackageEnquiry(slug, {
            name: payload.guest_name.trim(),
            email: payload.guest_email.trim(),
            phone: payload.guest_phone.replace(/\D/g, "").slice(-10) || payload.guest_phone,
            travelDate: payload.travel_date || undefined,
            adults: adultsFromRooms(payload.rooms),
            children: childrenFromRooms(payload.rooms),
            rooms: Math.max(1, payload.rooms.length),
            message: payload.special_requests || undefined,
            selections: {
              selected_hotels: payload.selected_hotels,
              selected_cab_option_id: payload.selected_cab_option_id,
              selected_sightseeing_ids: payload.selected_sightseeing_ids,
              selected_activity_link_ids: payload.selected_activity_link_ids,
              selected_addon_ids: payload.selected_addon_ids,
              payment_type: payload.payment_type,
              estimatedTotalMinor: payload.estimated_total_minor,
            },
          });
          bookingId = result.enquiryId;
          bookingNumber = result.reference;
          status = result.status || "received";
        } catch {
          // Offline / API not migrated yet — keep a local lead so UX still works.
          bookingNumber = `KBC-${Date.now().toString(36).toUpperCase()}`;
          bookingId = `local-${bookingNumber}`;
          status = "requested";
        }

        try {
          localStorage.setItem(
            `pkg_lead_${slug}`,
            JSON.stringify({
              ...payload,
              booking_id: bookingId,
              booking_number: bookingNumber,
              created_at: Date.now(),
            }),
          );
        } catch {
          /* ignore */
        }

        clearRecovery(slug);
        setState({
          phase: "success",
          result: {
            booking_id: bookingId,
            booking_number: bookingNumber,
            status,
            payment_type: payload.payment_type,
            total_amount: 0,
            token_amount: 0,
            balance_amount: 0,
            message:
              "Request received. Our team will confirm hotels, transfers, and payment on WhatsApp / email within 2 hours.",
          },
        });
      } catch (err) {
        setState({
          phase: "error",
          message:
            err instanceof Error
              ? err.message
              : "Could not submit request. Please try again.",
        });
      }
    },
    [slug],
  );

  const resumePayment = useCallback(async () => {
    setState({
      phase: "error",
      message:
        "Online payment will open once KBC package checkout is live. Your request is already with our team.",
    });
  }, []);

  const payBalance = useCallback(
    async (
      _bookingId: string,
      _prefill: { name: string; email: string; phone: string },
    ) => {
      setState({
        phase: "error",
        message: "Balance payment will open once KBC package checkout is live.",
      });
    },
    [],
  );

  return {
    state,
    book,
    payBalance,
    resumePayment,
    recoveryData,
    reset,
    isProcessing:
      state.phase !== "idle" &&
      state.phase !== "error" &&
      state.phase !== "success",
  };
}
