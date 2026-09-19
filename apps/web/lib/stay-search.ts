import { isoDaysFromNow } from './booking-api';

export type StayQuery = {
  city?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
};

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : fallback;

export const defaultStay = (): StayQuery => ({
  checkIn: isoDaysFromNow(7),
  checkOut: isoDaysFromNow(9),
  adults: 2,
  children: 0,
});

export const parseStaySearch = (params: {
  city?: string;
  q?: string;
  checkIn?: string;
  checkOut?: string;
  start?: string;
  end?: string;
  adults?: string;
  children?: string;
}): StayQuery => {
  const defaults = defaultStay();
  const checkIn = isoDate.test(params.checkIn ?? '')
    ? params.checkIn!
    : isoDate.test(params.start ?? '')
      ? params.start!
      : defaults.checkIn;
  let checkOut = isoDate.test(params.checkOut ?? '')
    ? params.checkOut!
    : isoDate.test(params.end ?? '')
      ? params.end!
      : defaults.checkOut;
  if (checkOut <= checkIn) {
    const next = new Date(`${checkIn}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 2);
    checkOut = next.toISOString().slice(0, 10);
  }
  return {
    city: (params.city ?? params.q)?.trim() || undefined,
    checkIn,
    checkOut,
    adults: clamp(Number(params.adults), 1, 10, defaults.adults),
    children: clamp(Number(params.children), 0, 10, 0),
  };
};

export const staySearchParams = (stay: StayQuery, extra?: Record<string, string | number | undefined | null>) => {
  const params = new URLSearchParams();
  if (stay.city) params.set('city', stay.city);
  params.set('checkIn', stay.checkIn);
  params.set('checkOut', stay.checkOut);
  params.set('adults', String(stay.adults));
  params.set('children', String(stay.children));
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== null && String(value).length > 0) params.set(key, String(value));
  }
  return params;
};

export const stayHref = (path: string, stay: StayQuery, extra?: Record<string, string | number | undefined | null>) =>
  `${path}?${staySearchParams(stay, extra).toString()}`;

export const stayNights = (stay: StayQuery) => {
  const ms = new Date(`${stay.checkOut}T00:00:00Z`).getTime() - new Date(`${stay.checkIn}T00:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

export const formatStayDay = (iso: string, options?: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    ...options,
  });

export const guestLabel = (stay: StayQuery) => {
  const count = stay.adults + stay.children;
  return `${count} guest${count === 1 ? '' : 's'}`;
};
