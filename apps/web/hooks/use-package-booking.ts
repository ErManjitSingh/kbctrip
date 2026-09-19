"use client";

/**
 * Package booking — KBC enquiry mode (no Unotrips / Razorpay yet).
 * Saves a local lead and returns a success result the UI already understands.
 */

import { useState, useCallback, useEffect } from "react";
import type { RoomConfig } from "@/hooks/useRoomsConfig";

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

        const bookingNumber = `KBC-${Date.now().toString(36).toUpperCase()}`;
        const bookingId = `local-${bookingNumber}`;
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

        await new Promise((r) => setTimeout(r, 450));

        clearRecovery(slug);
        setState({
          phase: "success",
          result: {
            booking_id: bookingId,
            booking_number: bookingNumber,
            status: "requested",
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
