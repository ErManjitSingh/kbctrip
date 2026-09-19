'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarCheck, CheckCircle2, MapPin } from 'lucide-react';
import { BookFlowShell } from '../../components/BookFlowShell';
import { useGuestAuth } from '../../components/GuestAuthProvider';
import {
  cancelGuestBooking,
  formatPrice,
  getBooking,
  getGuestBooking,
  type BookingView,
} from '../../lib/booking-api';
import { formatStayDay } from '../../lib/stay-search';

function ConfirmationView() {
  const params = useSearchParams();
  const { guest, token } = useGuestAuth();
  const slug = params.get('slug') ?? '';
  const bookingId = params.get('bookingId') ?? '';
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [owned, setOwned] = useState(false);
  const [asking, setAsking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !bookingId) return;
    void getBooking(slug, bookingId).then(setBooking);
  }, [bookingId, slug]);

  useEffect(() => {
    if (!token || !bookingId) return;
    void getGuestBooking(token, bookingId).then((ownedBooking) => {
      if (!ownedBooking) return;
      setOwned(true);
      setBooking(ownedBooking);
    });
  }, [bookingId, token]);

  const today = new Date().toISOString().slice(0, 10);
  const canCancel = Boolean(
    owned &&
      token &&
      booking &&
      booking.checkIn >= today &&
      (booking.status === 'confirmed' || booking.status === 'held' || booking.status === 'quote')
  );

  const cancel = async () => {
    if (!token || !booking) return;
    setCancelling(true);
    setMessage(null);
    try {
      const result = await cancelGuestBooking(token, booking.id);
      setBooking({ ...booking, status: 'cancelled' });
      setAsking(false);
      setMessage(
        result.refundAmountMinor > 0
          ? `Cancelled. Refund ${formatPrice(result.refundAmountMinor, booking.property?.currency)} is mocked.`
          : 'Stay cancelled. No refund on this rate.'
      );
    } catch (cancelError) {
      setMessage(cancelError instanceof Error ? cancelError.message : 'Could not cancel this stay');
    } finally {
      setCancelling(false);
    }
  };

  return booking ? (
    <div className="book-confirm">
      <div className={`book-ticket${booking.status === 'cancelled' ? ' book-ticket-cancelled' : ''}`}>
        <div className="book-ticket-banner">
          <CheckCircle2 size={34} />
          <div>
            <p>{booking.status === 'cancelled' ? 'Booking cancelled' : 'Booking confirmed'}</p>
            <h2>{booking.property?.name ?? 'Your stay'}</h2>
          </div>
        </div>
        <div className="book-ticket-ref">
          <small>Show this at reception</small>
          <strong>{booking.reference}</strong>
        </div>
        <div className="book-ticket-grid">
          <div>
            <small><MapPin size={13} /> Hotel</small>
            <b>{booking.property?.name ?? slug}</b>
            {booking.property?.city && <span>{booking.property.city}</span>}
          </div>
          <div>
            <small>Room</small>
            <b>{booking.roomType}</b>
            <span>{booking.guestName || 'Lead guest'}</span>
          </div>
          <div>
            <small><CalendarCheck size={13} /> Check-in</small>
            <b>{formatStayDay(booking.checkIn, { weekday: 'long' })}</b>
          </div>
          <div>
            <small>Check-out</small>
            <b>{formatStayDay(booking.checkOut, { weekday: 'long' })}</b>
          </div>
        </div>
        <div className="book-due">
          <span>{booking.status === 'cancelled' ? 'Was paid' : 'Paid'}</span>
          <strong>{formatPrice(booking.totalMinor, booking.property?.currency)}</strong>
        </div>
      </div>
      {message && <p className={message.startsWith('Could') ? 'book-error' : 'account-ok'}>{message}</p>}
      <div className="book-confirm-actions">
        <Link className="book-primary" href={guest ? '/account/bookings' : '/signup'}>
          {guest ? 'View in My trips' : 'Create an account to save trips'}
        </Link>
        {canCancel ? (
          asking ? (
            <button type="button" className="book-secondary book-cancel-confirm" disabled={cancelling} onClick={() => void cancel()}>
              {cancelling ? 'Cancelling…' : 'Yes, cancel stay'}
            </button>
          ) : (
            <button type="button" className="book-secondary" onClick={() => setAsking(true)}>
              Cancel this stay
            </button>
          )
        ) : (
          <Link className="book-secondary" href="/hotels">Browse more stays</Link>
        )}
      </div>
      {asking && (
        <button type="button" className="book-keep" onClick={() => setAsking(false)}>
          Keep the booking
        </button>
      )}
    </div>
  ) : (
    <p className="book-state">Loading confirmation…</p>
  );
}

export default function ConfirmationPage() {
  return (
    <BookFlowShell step={3} kicker="You’re booked" title="See you at the stay" confirm>
      <Suspense fallback={<p className="book-state">Loading confirmation…</p>}>
        <ConfirmationView />
      </Suspense>
    </BookFlowShell>
  );
}
