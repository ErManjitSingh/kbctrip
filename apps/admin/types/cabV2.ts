/** Minimal stub so leftover Unotrips new-cab step files typecheck. */
export type CabOwnerDropdownItem = {
  id: string;
  name: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  business_name?: string;
  city?: string;
};

export type CabOwnerOption = CabOwnerDropdownItem;

export type CabV2Form = Record<string, unknown>;
