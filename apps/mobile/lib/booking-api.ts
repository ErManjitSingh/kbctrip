import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const bookingApiUrl = () => {
  if (process.env.EXPO_PUBLIC_KBC_BOOKING_API_URL) {
    return process.env.EXPO_PUBLIC_KBC_BOOKING_API_URL;
  }
  // Android emulator → host machine loopback
  if (Platform.OS === 'android' && !(Constants as { isDevice?: boolean }).isDevice) {
    return 'http://10.0.2.2:4000/api';
  }
  return 'http://127.0.0.1:4000/api';
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
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(priceMinor / 100);
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
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<T>;
    return body.data;
  } catch {
    return null;
  }
};

const sendJson = async <T>(
  path: string,
  method: 'POST' | 'PATCH',
  payload: unknown,
  token?: string | null,
): Promise<T> => {
  const response = await fetch(`${bookingApiUrl()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => null)) as
    | (ApiEnvelope<T> & { message?: string | string[] })
    | null;
  if (!response.ok) {
    const message = body?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || `Request failed (${response.status})`);
  }
  if (!body || !('data' in body)) throw new Error('Unexpected API response');
  return body.data;
};

export const listProperties = (city?: string, page = 1) => {
  const params = new URLSearchParams({ limit: '12', page: String(page) });
  if (city?.trim()) params.set('city', city.trim());
  return getJson<MarketplaceCatalog>(`/public/properties?${params}`);
};

export const getPropertyDetail = (slug: string) => getJson<PropertyDetail>(`/public/${slug}/property`);

export const getAvailability = (slug: string, checkIn: string, checkOut: string, adults = 2, children = 0) =>
  getJson<{
    nights: number;
    rooms: AvailableRoom[];
    property: { name: string; slug: string; city: string | null; currency: string };
  }>(`/public/${slug}/availability?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);

export const getPackages = (slug: string) => getJson<CatalogPackage[]>(`/public/${slug}/packages`);
export const getPaidServices = (slug: string) => getJson<CatalogAddon[]>(`/public/${slug}/paid-services`);
export const getExperiences = (slug: string) => getJson<CatalogExperience[]>(`/public/${slug}/experiences`);
export const getPlaces = (slug: string) => getJson<NearbyPlace[]>(`/public/${slug}/places`);
export const getRoomTypes = (slug: string) => getJson<CatalogRoom[]>(`/public/${slug}/rooms`);
export const getBooking = (slug: string, bookingId: string) =>
  getJson<BookingView>(`/public/${slug}/booking/${bookingId}`);

export const createHold = (slug: string, payload: HoldPayload, token?: string | null) =>
  sendJson<HoldResult>(`/public/${slug}/hold`, 'POST', payload, token);

export const confirmBooking = (slug: string, bookingId: string) =>
  sendJson<{ id: string; reference: string; status: string }>(`/public/${slug}/confirm`, 'POST', { bookingId });

export const guestRegister = (payload: { name: string; email: string; password: string; phone?: string }) =>
  sendJson<{ accessToken: string; guest: GuestProfile }>('/guest/auth/register', 'POST', payload);

export const guestLogin = (payload: { email: string; password: string }) =>
  sendJson<{ accessToken: string; guest: GuestProfile }>('/guest/auth/login', 'POST', payload);

export const getGuestMe = (token: string) => getJson<GuestProfile>('/guest/me', token);

export const updateGuestMe = (token: string, payload: { name?: string; phone?: string }) =>
  sendJson<GuestProfile>('/guest/me', 'PATCH', payload, token);

export const getGuestBookings = (token: string) =>
  getJson<{ upcoming: GuestBookingSummary[]; past: GuestBookingSummary[] }>('/guest/bookings', token);

export const getGuestBooking = (token: string, bookingId: string) =>
  getJson<BookingView>(`/guest/bookings/${bookingId}`, token);

export const cancelGuestBooking = (token: string, bookingId: string, reason?: string) =>
  sendJson<GuestCancelResult>(`/guest/bookings/${bookingId}/cancel`, 'POST', { reason }, token);
