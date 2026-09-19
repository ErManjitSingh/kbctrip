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
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
}): StayQuery => {
  const defaults = defaultStay();
  const checkIn = isoDate.test(params.checkIn ?? '') ? params.checkIn! : defaults.checkIn;
  let checkOut = isoDate.test(params.checkOut ?? '') ? params.checkOut! : defaults.checkOut;
  if (checkOut <= checkIn) {
    const next = new Date(`${checkIn}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 2);
    checkOut = next.toISOString().slice(0, 10);
  }
  return {
    city: params.city?.trim() || undefined,
    checkIn,
    checkOut,
    adults: clamp(Number(params.adults), 1, 10, defaults.adults),
    children: clamp(Number(params.children), 0, 10, 0),
  };
};

export const stayNights = (stay: StayQuery) => {
  const ms = new Date(`${stay.checkOut}T00:00:00Z`).getTime() - new Date(`${stay.checkIn}T00:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

export const formatStayDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

export const guestLabel = (stay: StayQuery) => {
  const count = stay.adults + stay.children;
  return `${count} guest${count === 1 ? '' : 's'}`;
};
