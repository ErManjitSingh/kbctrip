import { SITE } from "@/lib/constants";

/** Travel home — Unotrips layout shell with KBC Trip branding. */
export const TRAVEL_HOME_BRAND = {
  name: SITE.name,
  tagline: SITE.tagline,
} as const;

/**
 * File logo for Image-based slots (auth modals, etc.).
 * Prefer `<BrandLogo />` in nav/footer for the real KBC mark + wordmark.
 */
export const TRAVEL_HOME_LOGO_SRC = "/images/kbc-trip-mark.svg" as const;
