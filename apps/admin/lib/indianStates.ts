// src/lib/indianStates.ts
// -----------------------------------------------------------------------------
// Single source of truth for Indian state/UT names used across the admin panel.
//
// WHY THIS EXISTS: previously, the property location form (WizardStep2) had
// its own local STATES array, and the State Pricing form (state-pricing/
// page.tsx) was a free-text input with no list at all. That meant a state
// pricing rule could be typed as "himachal pradesh" while every real
// property stored "Himachal Pradesh" -- since the Pricing Engine matches
// property.state to state_pricing.state with a plain, case-sensitive
// string comparison, that rule would silently never apply to any property,
// with no error anywhere telling you why.
//
// UPDATE: this list was also cross-checked against the separate Ops Team
// frontend's own property-creation form, which had 5 real union
// territories this list was missing entirely (Andaman and Nicobar
// Islands, Chandigarh, Ladakh, Lakshadweep, Puducherry). A property
// created by Ops in any of those 5 places had no way to ever get a State
// Pricing rule set here, since the option didn't exist in this dropdown
// at all. This list is now the same 35 entries as the Ops repo's
// src/lib/indianStates.ts -- both must be kept in sync by hand whenever a
// state/UT is added, since they live in two separate codebases with no
// shared package between them.
//
// UPDATE 2: found a THIRD independent copy of this list, in
// app/admin/packages/new/page.tsx (the package create/edit form's own
// State dropdown) -- which had "Jammu and Kashmir" where every other copy
// says "Jammu & Kashmir" (same class of mismatch as the Ops discovery
// above), and also included "Dadra and Nagar Haveli and Daman and Diu" --
// a real UT that this canonical list was missing entirely. Added below.
// That file now imports from here instead of keeping its own copy.
//
// Both the property form and the State Pricing form now import this same
// list, so a state picked in either place is always the exact same string
// -- spelling and case mismatches between the two become structurally
// impossible instead of a manual-entry risk.
// -----------------------------------------------------------------------------

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu & Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
] as const