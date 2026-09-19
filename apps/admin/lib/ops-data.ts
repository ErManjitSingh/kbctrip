import type { BookingRow, GuestRow, SupportTicket } from './types';

const BOOKINGS_KEY = 'kbc_trip_ops_bookings_v1';
const GUESTS_KEY = 'kbc_trip_ops_guests_v1';
const TICKETS_KEY = 'kbc_trip_ops_tickets_v1';

const seedBookings: BookingRow[] = [
  {
    id: '1',
    ref: 'KT-9182',
    guest: 'Aarav Mehta',
    email: 'aarav@email.com',
    phone: '+91 98214 21001',
    hotel: 'The Cedar House',
    hotelSlug: 'the-cedar-house',
    city: 'Manali',
    checkIn: '2026-08-22',
    checkOut: '2026-08-25',
    nights: 3,
    guests: 2,
    rooms: 1,
    amount: 18400,
    tax: 2208,
    status: 'confirmed',
    payment: 'razorpay',
    source: 'marketplace',
    createdAt: '2026-08-15T09:12:00+05:30',
    notes: '',
    timeline: [
      { at: '2026-08-15T09:12:00+05:30', label: 'Hold created', detail: '10-minute folio hold' },
      { at: '2026-08-15T09:16:00+05:30', label: 'Payment captured', detail: 'Razorpay · mock' },
      { at: '2026-08-15T09:16:20+05:30', label: 'Confirmed', detail: 'Ticket sent to guest' },
    ],
  },
  {
    id: '2',
    ref: 'KT-9177',
    guest: 'Riya Sharma',
    email: 'riya@email.com',
    phone: '+91 98883 12044',
    hotel: 'Palm Court Goa',
    hotelSlug: 'palm-court-goa',
    city: 'Goa',
    checkIn: '2026-08-18',
    checkOut: '2026-08-21',
    nights: 3,
    guests: 2,
    rooms: 1,
    amount: 22650,
    tax: 2718,
    status: 'held',
    payment: 'hold',
    source: 'marketplace',
    createdAt: '2026-08-15T08:41:00+05:30',
    notes: 'Guest asked about late check-in.',
    timeline: [
      { at: '2026-08-15T08:41:00+05:30', label: 'Hold created', detail: 'Expires in ~6 min' },
    ],
  },
  {
    id: '3',
    ref: 'KT-9160',
    guest: 'Kabir Singh',
    email: 'kabir@email.com',
    phone: '+91 97441 09012',
    hotel: 'Jaipur Heritage Inn',
    hotelSlug: 'jaipur-heritage-inn',
    city: 'Jaipur',
    checkIn: '2026-08-20',
    checkOut: '2026-08-22',
    nights: 2,
    guests: 3,
    rooms: 1,
    amount: 9800,
    tax: 1176,
    status: 'confirmed',
    payment: 'razorpay',
    source: 'marketplace',
    createdAt: '2026-08-14T21:05:00+05:30',
    notes: '',
    timeline: [
      { at: '2026-08-14T21:05:00+05:30', label: 'Hold created' },
      { at: '2026-08-14T21:08:00+05:30', label: 'Confirmed' },
    ],
  },
  {
    id: '4',
    ref: 'KT-9041',
    guest: 'Neha Kapoor',
    email: 'neha@email.com',
    phone: '+91 99720 55018',
    hotel: 'Valley Nest',
    hotelSlug: 'valley-nest',
    city: 'Shimla',
    checkIn: '2026-08-16',
    checkOut: '2026-08-18',
    nights: 2,
    guests: 2,
    rooms: 1,
    amount: 11200,
    tax: 1344,
    status: 'cancelled',
    payment: 'refunded',
    source: 'marketplace',
    createdAt: '2026-08-13T16:22:00+05:30',
    notes: 'Cancelled by guest — weather.',
    timeline: [
      { at: '2026-08-13T16:22:00+05:30', label: 'Confirmed' },
      { at: '2026-08-14T11:02:00+05:30', label: 'Cancelled', detail: 'Full refund queued' },
    ],
  },
  {
    id: '5',
    ref: 'KT-9012',
    guest: 'Ishaan Rao',
    email: 'ishaan@email.com',
    phone: '+91 90112 33445',
    hotel: 'Dubai Marina Stay',
    hotelSlug: 'dubai-marina-stay',
    city: 'Dubai',
    checkIn: '2026-09-02',
    checkOut: '2026-09-06',
    nights: 4,
    guests: 2,
    rooms: 1,
    amount: 54800,
    tax: 6576,
    status: 'refunded',
    payment: 'refunded',
    source: 'marketplace',
    createdAt: '2026-08-12T11:48:00+05:30',
    notes: '',
    timeline: [
      { at: '2026-08-12T11:48:00+05:30', label: 'Confirmed' },
      { at: '2026-08-13T09:10:00+05:30', label: 'Refunded', detail: 'Visa delay' },
    ],
  },
  {
    id: '6',
    ref: 'KT-8994',
    guest: 'Ananya Iyer',
    email: 'ananya@email.com',
    phone: '+91 98100 77821',
    hotel: 'Kashmir Houseboat',
    hotelSlug: 'kashmir-houseboat',
    city: 'Srinagar',
    checkIn: '2026-08-28',
    checkOut: '2026-08-31',
    nights: 3,
    guests: 2,
    rooms: 1,
    amount: 27100,
    tax: 3252,
    status: 'confirmed',
    payment: 'razorpay',
    source: 'marketplace',
    createdAt: '2026-08-12T09:03:00+05:30',
    notes: '',
    timeline: [
      { at: '2026-08-12T09:03:00+05:30', label: 'Hold created' },
      { at: '2026-08-12T09:07:00+05:30', label: 'Confirmed' },
    ],
  },
  {
    id: '7',
    ref: 'KT-9201',
    guest: 'Dev Patel',
    email: 'dev@email.com',
    phone: '+91 98200 11990',
    hotel: 'Palm Court Goa',
    hotelSlug: 'palm-court-goa',
    city: 'Goa',
    checkIn: '2026-08-24',
    checkOut: '2026-08-26',
    nights: 2,
    guests: 4,
    rooms: 2,
    amount: 31200,
    tax: 3744,
    status: 'completed',
    payment: 'razorpay',
    source: 'marketplace',
    createdAt: '2026-08-01T14:20:00+05:30',
    notes: '',
    timeline: [
      { at: '2026-08-01T14:20:00+05:30', label: 'Confirmed' },
      { at: '2026-08-26T11:00:00+05:30', label: 'Checked out' },
    ],
  },
];

const seedGuests: GuestRow[] = [
  {
    id: 'g1',
    name: 'Aarav Mehta',
    email: 'aarav@email.com',
    phone: '+91 98214 21001',
    city: 'Mumbai',
    trips: 6,
    spend: 84200,
    status: 'vip',
    joinedAt: '2025-11-02',
    lastTripAt: '2026-08-15',
    tags: ['repeat', 'hills'],
  },
  {
    id: 'g2',
    name: 'Riya Sharma',
    email: 'riya@email.com',
    phone: '+91 98883 12044',
    city: 'Mumbai',
    trips: 4,
    spend: 51200,
    status: 'active',
    joinedAt: '2026-01-18',
    lastTripAt: '2026-08-15',
    tags: ['goa'],
  },
  {
    id: 'g3',
    name: 'Kabir Singh',
    email: 'kabir@email.com',
    phone: '+91 97441 09012',
    city: 'Delhi',
    trips: 2,
    spend: 18600,
    status: 'active',
    joinedAt: '2026-03-04',
    lastTripAt: '2026-08-14',
    tags: [],
  },
  {
    id: 'g4',
    name: 'Neha Kapoor',
    email: 'neha@email.com',
    phone: '+91 99720 55018',
    city: 'Chandigarh',
    trips: 1,
    spend: 11200,
    status: 'active',
    joinedAt: '2026-07-21',
    lastTripAt: '2026-08-13',
    tags: ['cancelled'],
  },
  {
    id: 'g5',
    name: 'Spam Account',
    email: 'spam@fake.com',
    phone: '+91 90000 00000',
    city: '—',
    trips: 0,
    spend: 0,
    status: 'blocked',
    joinedAt: '2026-08-01',
    lastTripAt: null,
    tags: ['abuse'],
  },
  {
    id: 'g6',
    name: 'Ananya Iyer',
    email: 'ananya@email.com',
    phone: '+91 98100 77821',
    city: 'Bengaluru',
    trips: 3,
    spend: 41900,
    status: 'active',
    joinedAt: '2026-02-11',
    lastTripAt: '2026-08-12',
    tags: ['kashmir'],
  },
];

const seedTickets: SupportTicket[] = [
  {
    id: 't1',
    subject: 'Late check-in for KT-9177',
    bookingRef: 'KT-9177',
    guest: 'Riya Sharma',
    priority: 'urgent',
    status: 'open',
    updatedAt: '2026-08-15T10:02:00+05:30',
  },
  {
    id: 't2',
    subject: 'Refund status for KT-9041',
    bookingRef: 'KT-9041',
    guest: 'Neha Kapoor',
    priority: 'normal',
    status: 'pending',
    updatedAt: '2026-08-15T08:15:00+05:30',
  },
  {
    id: 't3',
    subject: 'Invoice copy requested',
    bookingRef: 'KT-8994',
    guest: 'Ananya Iyer',
    priority: 'low',
    status: 'open',
    updatedAt: '2026-08-14T19:40:00+05:30',
  },
];

const read = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return seed;
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
};

const write = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const loadBookings = () => read(BOOKINGS_KEY, seedBookings);
export const saveBookings = (rows: BookingRow[]) => write(BOOKINGS_KEY, rows);

export const loadGuests = () => read(GUESTS_KEY, seedGuests);
export const saveGuests = (rows: GuestRow[]) => write(GUESTS_KEY, rows);

export const loadTickets = () => read(TICKETS_KEY, seedTickets);
export const saveTickets = (rows: SupportTicket[]) => write(TICKETS_KEY, rows);

export const dashboardMockStats = () => {
  const bookings = loadBookings();
  const today = bookings.filter((b) => b.createdAt.startsWith('2026-08-15')).length;
  const held = bookings.filter((b) => b.status === 'held').length;
  const gmv = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0);
  const tickets = loadTickets().filter((t) => t.status !== 'resolved').length;
  return { today, held, gmv, tickets };
};
