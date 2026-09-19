"use client";

/**
 * Local KBC package pricing — no Unotrips fulfillment-price API.
 */

import { useEffect, useMemo, useState } from "react";
import type { FulfillmentPricingResponse } from "@/lib/package-fulfillment-types";

const GST_RATE = 0.05;

export type UseFulfillmentPriceOptions = {
  slug: string;
  packageId: string;
  travelDate: string | null;
  rooms: Array<{ adults: number; children: number }>;
  selectedHotels: Array<{ option_id: string; room_type_id: string | null }>;
  selectedCabOptionId: string | null;
  tokenPercent?: number | null;
  selectedSightseeingIds: string[];
  selectedActivityLinkIds: string[];
  selectedAddonIds: string[];
  enabled?: boolean;
  basePricePerPerson?: number | null;
  hotelUpgradeTotal?: number;
  cabUpgradeTotal?: number;
  activitiesTotal?: number;
  addonsTotal?: number;
  packageTokenPercent?: number;
};

export type UseFulfillmentPriceResult = {
  isLoading: boolean;
  hasPrice: boolean;
  isStale: boolean;
  errorMessage: string | null;
  grandTotal: number;
  tokenAmount: number;
  tokenPercent: number;
  minTokenPercent: number | null;
  balanceAmount: number;
  subtotal: number;
  hotelUpgrade: number;
  cabUpgrade: number;
  volvoBusCost: number;
  activitiesTotal: number;
  addonsTotal: number;
  isComplete: boolean;
  tokenPaymentAvailable: boolean;
  basePackagePrice: number;
  totalAdults: number;
  totalGuests: number;
  raw: FulfillmentPricingResponse | null;
};

function computePrice(opts: UseFulfillmentPriceOptions): FulfillmentPricingResponse {
  const adults = opts.rooms.reduce((sum, room) => sum + Math.max(0, room.adults), 0);
  const children = opts.rooms.reduce((sum, room) => sum + Math.max(0, room.children), 0);
  const billable = Math.max(adults, 1);
  const perPerson = Math.max(0, opts.basePricePerPerson ?? 0);
  const basePackage = perPerson * billable;
  const hotelUpgrade = Math.max(0, opts.hotelUpgradeTotal ?? 0);
  const cabUpgrade = Math.max(0, opts.cabUpgradeTotal ?? 0);
  const activitiesTotal = Math.max(0, opts.activitiesTotal ?? 0);
  const addonsTotal = Math.max(0, opts.addonsTotal ?? 0);
  const subtotal = basePackage + hotelUpgrade + cabUpgrade + activitiesTotal + addonsTotal;
  const gst = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gst;
  const floorPct = Math.min(100, Math.max(10, opts.packageTokenPercent ?? 40));
  const chosenPct =
    opts.tokenPercent != null
      ? Math.min(100, Math.max(floorPct, opts.tokenPercent))
      : floorPct;
  const tokenAmount = Math.round((grandTotal * chosenPct) / 100);
  const balanceAmount = Math.max(0, grandTotal - tokenAmount);

  return {
    passenger_manifest: {
      total_adults: adults,
      total_children: children,
      total_infants: 0,
      total_headcount: adults + children,
      requested_room_count: Math.max(1, opts.rooms.length),
    },
    pricing_summary: {
      base_package_price: basePackage,
      hotel_upgrade_total: hotelUpgrade,
      cab_upgrade_total: cabUpgrade,
      volvo_bus_cost: 0,
      extra_bed_total: 0,
      infant_cot_total: 0,
      activities_total: activitiesTotal,
      addons_total: addonsTotal,
      package_subtotal: subtotal,
      pricing_breakdown: [
        {
          component: "base_package",
          label: "Base package",
          amount: basePackage,
          note: `${billable} adult${billable === 1 ? "" : "s"} × ₹${perPerson.toLocaleString("en-IN")}`,
        },
        ...(hotelUpgrade
          ? [{ component: "hotel_upgrade", label: "Hotel upgrade", amount: hotelUpgrade }]
          : []),
        ...(cabUpgrade
          ? [{ component: "cab_upgrade", label: "Cab upgrade", amount: cabUpgrade }]
          : []),
        ...(addonsTotal
          ? [{ component: "addons", label: "Add-ons", amount: addonsTotal }]
          : []),
      ],
      warnings: [],
      is_complete: perPerson > 0,
    },
    gst_result: {
      taxable_amount: subtotal,
      gst_rate: GST_RATE,
      gst_regime: "without_itc",
      cgst_rate: GST_RATE / 2,
      cgst_amount: Math.round(gst / 2),
      sgst_rate: GST_RATE / 2,
      sgst_amount: Math.round(gst / 2),
      igst_rate: 0,
      igst_amount: 0,
      total_gst: gst,
      grand_total: grandTotal,
      gst_label: "GST @ 5% (CGST 2.5% + SGST 2.5%)",
      supply_type: "intra_state",
      sac_code: "9985",
      is_tax_exempt: false,
      rule_version: "kbc-local-1",
      gst_engine_version: "kbc-local",
    },
    grand_total: grandTotal,
    token_amount: tokenAmount,
    token_percent: chosenPct,
    min_token_percent: floorPct,
    balance_amount: balanceAmount,
    is_complete: perPerson > 0,
    warnings: [],
    allocation_policy: "kbc-marketplace-local",
  };
}

export function useFulfillmentPrice(
  opts: UseFulfillmentPriceOptions,
): UseFulfillmentPriceResult {
  const enabled = opts.enabled !== false;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => setTick((n) => n + 1), 180);
    return () => clearTimeout(t);
  }, [
    enabled,
    opts.slug,
    opts.packageId,
    opts.travelDate,
    opts.basePricePerPerson,
    opts.hotelUpgradeTotal,
    opts.cabUpgradeTotal,
    opts.activitiesTotal,
    opts.addonsTotal,
    opts.tokenPercent,
    opts.packageTokenPercent,
    JSON.stringify(opts.rooms),
    JSON.stringify(opts.selectedHotels),
    opts.selectedCabOptionId,
    opts.selectedAddonIds.join(","),
  ]);

  const data = useMemo(() => {
    if (!enabled || !opts.slug || !opts.packageId) return null;
    return computePrice(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, enabled]);

  const summary = data?.pricing_summary;
  const grandTotal = data?.grand_total ?? 0;
  const tokenAmount = data?.token_amount ?? 0;
  const tokenPercent = data?.token_percent ?? opts.packageTokenPercent ?? 40;
  const minTokenPercent = data?.min_token_percent ?? opts.packageTokenPercent ?? 40;
  const balanceAmount = data?.balance_amount ?? 0;

  return {
    isLoading: enabled && !data,
    hasPrice: Boolean(data && (opts.basePricePerPerson ?? 0) > 0),
    isStale: false,
    errorMessage: null,
    grandTotal,
    tokenAmount,
    tokenPercent,
    minTokenPercent,
    balanceAmount,
    subtotal: summary?.package_subtotal ?? 0,
    hotelUpgrade: summary?.hotel_upgrade_total ?? 0,
    cabUpgrade: summary?.cab_upgrade_total ?? 0,
    volvoBusCost: 0,
    activitiesTotal: summary?.activities_total ?? 0,
    addonsTotal: summary?.addons_total ?? 0,
    isComplete: summary?.is_complete ?? false,
    tokenPaymentAvailable: tokenAmount > 0 && tokenAmount < grandTotal,
    basePackagePrice: summary?.base_package_price ?? 0,
    totalAdults: data?.passenger_manifest?.total_adults ?? 0,
    totalGuests: data?.passenger_manifest?.total_headcount ?? 0,
    raw: data,
  };
}
