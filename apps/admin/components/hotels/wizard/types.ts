export type PropertyType =
  | 'hotel' | 'resort' | 'boutique_hotel' | 'heritage_hotel'
  | 'villa' | 'homestay' | 'service_apartment' | 'hostel'

export type BedType = 'single' | 'double' | 'twin' | 'queen' | 'king' | 'bunk'
export type CollectionType = 'uno_serviced' | 'uno_partner' | 'uno_preferred'

// ── Rate plans — rooms, pricing ────────────────────────────────────────────────
// Mirrors the Ops frontend's PropertyFormParts.tsx exactly. Keep these in
// sync across both codebases if the pricing model changes.

/**
 * One channel's rate plan under the four standard hotel meal-plan codes —
 * EP / CP / MAP / AP. All three channels (Website, Staff, Agent) use the
 * exact same model: four flat, fully independent, directly-entered rates.
 *   EP = room only, CP = room + breakfast, MAP = room + breakfast + 1
 *   more meal, AP = room + all meals.
 */
export interface RatePlanRates {
  ep:  number
  cp:  number
  map: number
  ap:  number
}

export function emptyRatePlanRates(): RatePlanRates {
  return { ep: 0, cp: 0, map: 0, ap: 0 }
}

export const RATE_PLAN_CODES: { code: keyof RatePlanRates; label: string }[] = [
  { code: 'ep',  label: 'EP'  },
  { code: 'cp',  label: 'CP'  },
  { code: 'map', label: 'MAP' },
  { code: 'ap',  label: 'AP'  },
]

export const RATE_PLAN_SUBLABELS: Record<keyof RatePlanRates, string> = {
  ep:  'Room only',
  cp:  'Room + breakfast',
  map: 'Room + breakfast + dinner',
  ap:  'Room + all meals',
}

/**
 * One channel's full pricing — main room rate plan plus its own extra
 * bed rate plan. Every channel (Website, Staff, Agent) carries both,
 * and all three use the identical flat-rate model.
 */
export interface ChannelRatePlan {
  room:      RatePlanRates
  extra_bed: RatePlanRates
}

export function emptyChannelRatePlan(): ChannelRatePlan {
  return { room: emptyRatePlanRates(), extra_bed: emptyRatePlanRates() }
}

/** Returns a fresh, independent copy of a ChannelRatePlan — used by the
 *  "Same as…" buttons so copying Website into Staff doesn't leave Staff
 *  sharing object references with Website (a one-time copy, not a live link). */
export function copyChannelRatePlan(source: ChannelRatePlan): ChannelRatePlan {
  return { room: { ...source.room }, extra_bed: { ...source.extra_bed } }
}

/** Per-channel rate plans. Website, Staff, and Agent are identical in
 *  structure and meaning — each is a flat, independently-entered
 *  ChannelRatePlan. Use the "Same as…" copy buttons on Staff and Agent
 *  to quickly fill them from another channel, then adjust. */
export interface RoomRatePlans {
  website: ChannelRatePlan
  staff:   ChannelRatePlan
  agent:   ChannelRatePlan
}

export const RATE_PLAN_CHANNELS: { key: keyof RoomRatePlans; label: string; emoji: string }[] = [
  { key: 'website', label: 'Website', emoji: '🌐' },
  { key: 'staff',   label: 'Staff',   emoji: '👤' },
  { key: 'agent',   label: 'Agent',   emoji: '🤝' },
]

/** Which channels each channel offers a "Same as…" copy-from button for.
 *  Website has none (it's the first one filled in). Staff can copy from
 *  Website. Agent can copy from either Website or Staff. */
export const RATE_PLAN_COPY_SOURCES: Record<keyof RoomRatePlans, (keyof RoomRatePlans)[]> = {
  website: [],
  staff:   ['website'],
  agent:   ['website', 'staff'],
}

export interface RoomTypePayload {
  // Present when this room was loaded from an existing property (i.e.
  // editing); absent for a brand-new room added in this session. The
  // backend matches on this id when present to update the existing
  // room in place (preserving its rate plans/overrides) instead of
  // deleting and recreating it — see BACKEND_MIGRATION_README.md.
  id?: string
  name: string
  description: string
  bed_type: BedType
  max_occupancy: number
  size_sqft: number
  count: number
  amenities: string[]
  images: string[]          // room-specific photos — uploaded in Step 8
  // Unified rate-plan pricing across Website/Staff/Agent channels —
  // each channel carries its own room rates AND its own extra bed
  // rates. Replaces the old flat base_price/weekend_price/
  // uno_staff_price/agent_price/meal_plans/extra_bed_price fields.
  rate_plans: RoomRatePlans
  // % markup applied on top of Website rates (room & extra bed) for
  // weekend nights. Does not apply to Staff or Agent rates.
  weekend_markup_percent: number
  is_active: boolean
}

// Quick-select presets for Room Name — Admin can also type a fully
// custom name. These are suggestions, not an enforced enum.
export const ROOM_TYPE_PRESETS = ['Standard', 'Deluxe', 'Super Deluxe', 'Family Suite']

export interface DiningVenue {
  name: string
  cuisine: string
  timing: string
  description: string
  open_to_public: boolean
}

export interface NearbyAttraction {
  name: string
  distance_km: string
}

export interface PhotoCategory {
  category: string
  label: string
  images: string[]
}

/**
 * Bank account details for payouts to the property partner. Entirely
 * optional — every field can be left blank. Lives on the PROPERTY, not
 * the partner, since one partner may own several properties each
 * potentially paid to a different account.
 */
export interface BankDetails {
  account_holder_name: string
  account_number:      string
  ifsc_code:           string
  bank_name:           string
  branch_name:         string
}

export function emptyBankDetails(): BankDetails {
  return { account_holder_name: '', account_number: '', ifsc_code: '', bank_name: '', branch_name: '' }
}

export interface WizardData {
  // Admin-only — which partner owns this property
  partner_id: string

  // Step 1 — Basic info
  name: string
  property_type: PropertyType
  star_category: number
  description: string
  total_rooms: number
  collection_type: CollectionType

  // Step 1 — Markup Management (Property-level override — Pricing Engine)
  // null = inherits from State, then Global. See EffectiveMarkup in
  // types/hotel.ts for the resolved value + source shown alongside these.
  website_markup_percent: number | null
  staff_markup_percent:   number | null
  agent_markup_percent:   number | null

  // Step 2 — Location
  address: string
  landmark: string
  city: string
  state: string
  pincode: string

  // Step 3 — Amenities
  amenities: string[]
  tags: string[]

  // Step 4 — Policies
  check_in_time: string
  check_out_time: string
  cancellation: string
  children: string
  pets: string
  smoking: string
  extra_bed: string
  early_check_in: string
  late_check_out: string
  age_restriction: string
  alcohol: string
  payment_methods: string[]

  // Step 5 — Contact
  contact_phone: string
  contact_email: string
  contact_whatsapp: string
  contact_website: string
  contact_gst: string
  nearby_attractions: NearbyAttraction[]
  // Optional — null when this property has never had payout details set.
  bank_details: BankDetails | null

  // Step 6 — Rooms
  room_types: RoomTypePayload[]

  // Step 7 — Dining
  dining_venues: DiningVenue[]

  // Step 8 — Photos
  photo_categories: PhotoCategory[]

  // Step 8 — Agreements (must all be true before submit unlocks)
  agreements: {
    terms_accepted:        boolean
    cancellation_accepted: boolean
    payment_accepted:      boolean
    legal_accepted:        boolean
  }
}

export const EMPTY_WIZARD: WizardData = {
  partner_id: '',
  name: '', property_type: 'hotel', star_category: 5,
  description: '', total_rooms: 0, collection_type: 'uno_partner',
  website_markup_percent: null, staff_markup_percent: null, agent_markup_percent: null,
  address: '', landmark: '', city: '', state: '', pincode: '',
  amenities: [], tags: [],
  check_in_time: '14:00', check_out_time: '11:00',
  cancellation: '', children: '', pets: '', smoking: '',
  extra_bed: '', early_check_in: '', late_check_out: '',
  age_restriction: '', alcohol: '', payment_methods: [],
  contact_phone: '', contact_email: '', contact_whatsapp: '',
  contact_website: '', contact_gst: '',
  nearby_attractions: [],
  bank_details: null,
  room_types: [],
  dining_venues: [],
  photo_categories: [],
  agreements: {
    terms_accepted:        false,
    cancellation_accepted: false,
    payment_accepted:      false,
    legal_accepted:        false,
  },
}

export const STEPS = [
  { number: 1, label: 'Basic info'   },
  { number: 2, label: 'Location'     },
  { number: 3, label: 'Amenities'    },
  { number: 4, label: 'Policies'     },
  { number: 5, label: 'Contact'      },
  { number: 6, label: 'Rooms'        },
  { number: 7, label: 'Dining'       },
  { number: 8, label: 'Photos'       },
]