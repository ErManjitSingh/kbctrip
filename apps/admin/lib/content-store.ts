import type { ContentDraft, OfferDraft } from './types';

const KEY = 'kbc_trip_ops_content_v1';

const defaultOffers: OfferDraft[] = [
  { id: 'o1', eyebrow: 'Goa Getaway', title: '35% off', detail: 'On hotels', href: '/hotels?offer=goa-getaway', live: true },
  { id: 'o2', eyebrow: 'Summer Special', title: '25% off', detail: 'On flights', href: '/flights?offer=summer-special', live: true },
  { id: 'o3', eyebrow: 'Weekend bus deals', title: 'From ₹499', detail: 'On bus tickets', href: '/buses?offer=weekend-bus', live: true },
  { id: 'o4', eyebrow: 'Weekend stays', title: 'Up to 20% off', detail: 'On selected stays', href: '/hotels?offer=weekend-bookings', live: false },
];

export const defaultContent = (): ContentDraft => ({
  closingQuote: 'Hotels, cabs and the itinerary sat in one place. We stopped juggling tabs and just went.',
  closingAttrib: 'Riya Sharma · Mumbai · Goa weekend',
  destinations: 'Goa, Manali, Kashmir, Dubai, Jaipur',
  offers: defaultOffers,
  updatedAt: new Date().toISOString(),
});

export const loadContent = (): ContentDraft => {
  if (typeof window === 'undefined') return defaultContent();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultContent();
    return JSON.parse(raw) as ContentDraft;
  } catch {
    return defaultContent();
  }
};

export const saveContent = (draft: ContentDraft) => {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
};
