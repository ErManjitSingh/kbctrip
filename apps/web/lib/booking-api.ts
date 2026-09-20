export const bookingApiUrl = () =>
  process.env.NEXT_PUBLIC_KBC_BOOKING_API_URL ??
  process.env.KBC_BOOKING_API_URL ??
  'http://localhost:4000/api';

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

export type PropertyDetail = {
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  country: string;
  description: string | null;
  address: string | null;
  amenities: string[];
  photos: string[];
  contactEmails: string[];
  whatsappNumber: string | null;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  logoUrl: string | null;
  bannerUrl: string | null;
};

export type AvailableRatePlan = {
  ratePlanId: string;
  name: string;
  refundable: boolean;
  mealPlan: string | null;
  roomSubtotalMinor: number;
  taxMinor: number;
  chargesMinor: number;
  promotionDiscountMinor: number;
  totalMinor: number;
};

export type AvailableRoom = {
  roomTypeId: string;
  name: string;
  description: string | null;
  maxOccupancy: number;
  amenities: string[];
  photos: string[];
  available: number;
  ratePlans: AvailableRatePlan[];
};

export type NearbyPlace = {
  id: string;
  name: string;
  category: string | null;
  distanceKm: number | null;
  mapUrl: string | null;
};

export type CatalogRatePlan = {
  id: string;
  name: string;
  description: string | null;
  refundable: boolean;
  mealPlan: string | null;
  cancellationPolicy: string | null;
};

export type CatalogRoom = {
  id: string;
  name: string;
  description: string | null;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  basePriceMinor: number;
  amenities: string[];
  photos: string[];
  units: number;
  ratePlans: CatalogRatePlan[];
};

export type CatalogPackage = {
  id: string;
  name: string;
  description: string | null;
  inclusions: string[];
  priceMinor: number;
};

export type CatalogAddon = {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number;
  unit?: string;
};

export type CatalogExperience = {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number;
  capacity: number | null;
};

export type MarketplaceHolidayPackage = {
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
  exclusions?: string[];
  highlights?: string[];
  itinerary?: ItineraryDay[];
  category: string | null;
  tags: string[];
  photos: string[];
  badge: string | null;
  published: boolean;
  sortOrder: number;
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

export type MarketplaceHolidayCatalog = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  packages: MarketplaceHolidayPackage[];
};

export type HoldPayload = {
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  couponCode?: string;
  packageIds?: string[];
  addonIds?: string[];
  experienceIds?: string[];
};

export type HoldResult = {
  bookingId: string;
  reference: string;
  roomType: string;
  ratePlan: string;
  checkIn: string;
  checkOut: string;
  totalMinor: number;
  holdExpiresAt: string;
};

export type BookingView = {
  id: string;
  reference: string;
  status: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalMinor: number;
  guestName: string;
  cancellable?: boolean;
  property?: { name: string; slug: string; city: string | null; currency: string };
  breakdown: {
    roomSubtotalMinor: number;
    packagesMinor: number;
    addonsMinor: number;
    experiencesMinor: number;
    taxMinor: number;
    chargesMinor: number;
    couponCode: string | null;
    couponDiscountMinor: number;
    promotionDiscountMinor: number;
    totalMinor: number;
  };
  packages: { name: string; priceMinor: number }[];
  addons: { name: string; priceMinor: number }[];
  experiences: { name: string; priceMinor: number }[];
};

export type GuestProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
};

export type GuestBookingSummary = {
  id: string;
  reference: string;
  status: string;
  checkIn: string;
  checkOut: string;
  totalMinor: number;
  roomType: string;
  property: { name: string; slug: string; city: string | null; currency: string };
  cancellable?: boolean;
};

export type GuestCancelResult = {
  bookingId: string;
  reference: string;
  refundAmountMinor: number;
  refundPermille: number;
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export const formatPrice = (priceMinor: number | null, currency = 'INR') => {
  if (priceMinor === null) return 'Price on request';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(priceMinor / 100);
};

export const isoDaysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getJson = async <T>(path: string, token?: string | null): Promise<T | null> => {
  try {
    const response = await fetch(`${bookingApiUrl()}${path}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<T>;
    return body.data;
  } catch {
    return null;
  }
};

const sendJson = async <T>(path: string, method: 'POST' | 'PATCH', payload: unknown, token?: string | null): Promise<T> => {
  const response = await fetch(`${bookingApiUrl()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => null)) as (ApiEnvelope<T> & { message?: string | string[] }) | null;
  if (!response.ok) {
    const message = body?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || `Request failed (${response.status})`);
  }
  if (!body || !('data' in body)) throw new Error('Unexpected API response');
  return body.data;
};

export const listProperties = (city?: string, page = 1, limit = 12) => {
  const params = new URLSearchParams({ limit: String(limit), page: String(page) });
  if (city?.trim()) params.set('city', city.trim());
  return getJson<MarketplaceCatalog>(`/public/properties?${params}`);
};

export type HolidayPackageQuery = {
  destination?: string;
  category?: string;
  departureCity?: string;
  minPrice?: string;
  maxPrice?: string;
  minDays?: string;
  maxDays?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export const listHolidayPackages = (query: HolidayPackageQuery = {}) => {
  const params = new URLSearchParams({
    limit: String(query.limit ?? 9),
    page: String(query.page ?? 1),
    sort: query.sort ?? 'popular',
  });
  if (query.destination?.trim()) params.set('destination', query.destination.trim());
  if (query.category?.trim()) params.set('category', query.category.trim());
  if (query.departureCity?.trim()) params.set('departureCity', query.departureCity.trim());
  if (query.minPrice) params.set('minPrice', query.minPrice);
  if (query.maxPrice) params.set('maxPrice', query.maxPrice);
  if (query.minDays) params.set('minDays', query.minDays);
  if (query.maxDays) params.set('maxDays', query.maxDays);
  return getJson<MarketplaceHolidayCatalog>(`/public/marketplace-packages?${params}`);
};

export const getHolidayPackage = (slug: string) =>
  getJson<MarketplaceHolidayPackage>(`/public/marketplace-packages/${slug}`);

export type PackageEnquirePayload = {
  name: string;
  email: string;
  phone: string;
  travelDate?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  message?: string;
  selections?: Record<string, unknown>;
};

export type PackageEnquireResult = {
  enquiryId: string;
  reference: string;
  status: string;
};

export const createPackageEnquiry = (slug: string, payload: PackageEnquirePayload) =>
  sendJson<PackageEnquireResult>(`/public/marketplace-packages/${encodeURIComponent(slug)}/enquire`, 'POST', payload);


export const getPropertyDetail = (slug: string) => getJson<PropertyDetail>(`/public/${slug}/property`);

export const getAvailability = (slug: string, checkIn: string, checkOut: string, adults = 2, children = 0) =>
  getJson<{ nights: number; rooms: AvailableRoom[]; property: { name: string; slug: string; city: string | null; currency: string } }>(
    `/public/${slug}/availability?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`
  );

export const getPlaces = (slug: string) => getJson<NearbyPlace[]>(`/public/${slug}/places`);
export const getRoomTypes = (slug: string) => getJson<CatalogRoom[]>(`/public/${slug}/rooms`);
export const getPackages = (slug: string) => getJson<CatalogPackage[]>(`/public/${slug}/packages`);
export const getPaidServices = (slug: string) => getJson<CatalogAddon[]>(`/public/${slug}/paid-services`);
export const getExperiences = (slug: string) => getJson<CatalogExperience[]>(`/public/${slug}/experiences`);
export const getBooking = (slug: string, bookingId: string) => getJson<BookingView>(`/public/${slug}/booking/${bookingId}`);

export const createHold = (slug: string, payload: HoldPayload, token?: string | null) =>
  sendJson<HoldResult>(`/public/${slug}/hold`, 'POST', payload, token);

export const confirmBooking = (slug: string, bookingId: string) =>
  sendJson<{ id: string; reference: string; status: string }>(`/public/${slug}/confirm`, 'POST', { bookingId });

export type PayOrderSession = {
  mock?: boolean;
  alreadyConfirmed?: boolean;
  bookingId: string;
  keyId?: string;
  orderId?: string | null;
  amountMinor?: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
};

export const createPayOrder = (slug: string, bookingId: string, preview = false) =>
  sendJson<PayOrderSession>(`/public/${slug}/pay/order`, 'POST', { bookingId, preview });

export const verifyPayOrder = (
  slug: string,
  payload: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) =>
  sendJson<{ id: string; reference: string; status: string }>(
    `/public/${slug}/pay/verify`,
    'POST',
    payload,
  );

export const guestRegister = (payload: { name: string; email: string; password: string; phone?: string }) =>
  sendJson<{ accessToken: string; guest: GuestProfile }>('/guest/auth/register', 'POST', payload);

export const guestLogin = (payload: { email: string; password: string }) =>
  sendJson<{ accessToken: string; guest: GuestProfile }>('/guest/auth/login', 'POST', payload);

export const getGuestMe = (token: string) => getJson<GuestProfile>('/guest/me', token);

export const updateGuestMe = (token: string, payload: { name?: string; phone?: string }) =>
  sendJson<GuestProfile>('/guest/me', 'PATCH', payload, token);

export const getGuestBookings = (token: string) =>
  getJson<{ upcoming: GuestBookingSummary[]; past: GuestBookingSummary[] }>('/guest/bookings', token);

export const getGuestBooking = (token: string, bookingId: string) => getJson<BookingView>(`/guest/bookings/${bookingId}`, token);

export const cancelGuestBooking = (token: string, bookingId: string, reason?: string) =>
  sendJson<GuestCancelResult>(`/guest/bookings/${bookingId}/cancel`, 'POST', { reason }, token);
