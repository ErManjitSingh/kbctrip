export type PlatformRole = 'super_admin' | 'ops' | 'support' | 'finance';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  propertyId?: string | null;
};

export type TenantSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  propertyCount: number;
  createdAt: string;
};

export type OnboardingApplication = {
  id: string;
  ownerName: string;
  email: string;
  phone: string | null;
  roomCount: number | null;
  currentPms: string | null;
  channels: string[];
  status: string;
  createdAt: string;
};

export type MarketplaceProperty = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  country: string;
  description: string | null;
  photos: string[];
  amenities: string[];
  currency: string;
  startingPriceMinor: number | null;
};

export type MarketplaceCatalog = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  properties: MarketplaceProperty[];
};

export type BookingStatus = 'confirmed' | 'held' | 'cancelled' | 'refunded' | 'completed';
export type GuestStatus = 'active' | 'blocked' | 'vip';

export type BookingEvent = {
  at: string;
  label: string;
  detail?: string;
};

export type BookingRow = {
  id: string;
  ref: string;
  guest: string;
  email: string;
  phone: string;
  hotel: string;
  hotelSlug: string;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  rooms: number;
  amount: number;
  tax: number;
  status: BookingStatus;
  payment: 'razorpay' | 'hold' | 'refunded' | 'none';
  source: 'marketplace' | 'direct';
  createdAt: string;
  notes: string;
  timeline: BookingEvent[];
};

export type GuestRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  trips: number;
  spend: number;
  status: GuestStatus;
  joinedAt: string;
  lastTripAt: string | null;
  tags: string[];
};

export type OfferDraft = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  live: boolean;
};

export type ContentDraft = {
  closingQuote: string;
  closingAttrib: string;
  destinations: string;
  offers: OfferDraft[];
  updatedAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  bookingRef: string | null;
  guest: string;
  priority: 'low' | 'normal' | 'urgent';
  status: 'open' | 'pending' | 'resolved';
  updatedAt: string;
};

export type MarketplacePackage = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  departureCity: string | null;
  days: number;
  nights: number;
  pricePerPersonMinor: number;
  currency: string;
  description: string | null;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  category: string | null;
  tags: string[];
  photos: string[];
  badge: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  activities?: string[];
  stay?: string;
  meals?: string;
  transfer?: string;
};

export type MarketplacePackageInput = {
  title: string;
  slug?: string;
  destination: string;
  departureCity?: string;
  days: number;
  nights: number;
  pricePerPersonMinor: number;
  currency?: string;
  description?: string;
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];
  itinerary?: ItineraryDay[];
  category?: string;
  tags?: string[];
  photos?: string[];
  badge?: string;
  published?: boolean;
  sortOrder?: number;
};

