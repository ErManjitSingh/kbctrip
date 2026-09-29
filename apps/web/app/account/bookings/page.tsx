'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { AccountShell } from '../../../components/AccountShell';
import { useGuestAuth } from '../../../components/GuestAuthProvider';
import {
  cancelGuestBooking,
  formatPrice,
  getGuestBookings,
  type GuestBookingSummary,
} from '../../../lib/booking-api';
import { formatStayDay } from '../../../lib/stay-search';

function TripTicket({
  booking,
  onCancelled,
}: {
  booking: GuestBookingSummary;
  onCancelled: (bookingId: string, message: string) => void;
}) {
  const { token } = useGuestAuth();
  const [asking, setAsking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    if (!token) return;
    setCancelling(true);
    try {
      const result = await cancelGuestBooking(token, booking.id);
      onCancelled(
        booking.id,
        result.refundAmountMinor > 0
          ? `${booking.reference} cancelled · refund ${formatPrice(result.refundAmountMinor, booking.property.currency)} mocked`
          : `${booking.reference} cancelled`
      );
    } catch (cancelError) {
      onCancelled(booking.id, cancelError instanceof Error ? cancelError.message : 'Could not cancel this stay');
    } finally {
      setCancelling(false);
      setAsking(false);
    }
  };

  return (
    <article className={`trip-ticket status-${booking.status}`}>
      <div className="trip-ticket-copy">
        <div className="trip-ticket-status">
          <em>{booking.status.replaceAll('_', ' ')}</em>
          <b>{booking.reference}</b>
        </div>
        <small><MapPin size={13} /> {booking.property.city ?? 'India'}</small>
        <h3>{booking.property.name}</h3>
        <p>{booking.roomType}</p>
        <span><CalendarDays size={13} /> {formatStayDay(booking.checkIn, { weekday: 'short' })} – {formatStayDay(booking.checkOut, { weekday: 'short' })}</span>
      </div>
      <div className="trip-ticket-pay">
        <strong>{formatPrice(booking.totalMinor, booking.property.currency)}</strong>
        <Link href={`/confirmation?slug=${encodeURIComponent(booking.property.slug)}&bookingId=${encodeURIComponent(booking.id)}`}>
          Open ticket <ArrowUpRight size={14} />
        </Link>
        {booking.cancellable && (
          asking ? (
            <div className="trip-cancel-row">
              <button type="button" className="trip-cancel-yes" disabled={cancelling} onClick={() => void cancel()}>
                {cancelling ? 'Cancelling…' : 'Yes, cancel'}
              </button>
              <button type="button" className="trip-cancel" onClick={() => setAsking(false)}>Keep</button>
            </div>
          ) : (
            <button type="button" className="trip-cancel" onClick={() => setAsking(true)}>
              Cancel stay
            </button>
          )
        )}
      </div>
    </article>
  );
}

export default function AccountBookingsPage() {
  const router = useRouter();
  const { ready, guest, token } = useGuestAuth();
  const [upcoming, setUpcoming] = useState<GuestBookingSummary[]>([]);
  const [past, setPast] = useState<GuestBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async (access: string) => {
    const data = await getGuestBookings(access);
    setUpcoming(data?.upcoming ?? []);
    setPast(data?.past ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    if (!guest || !token) {
      router.replace('/login?next=/account/bookings');
      return;
    }
    void load(token);
  }, [guest, ready, router, token]);

  if (!ready || !guest) {
    return <p className="page-width book-state">Opening your trips…</p>;
  }

  return (
    <AccountShell guest={guest} active="trips">
      {loading ? (
        <div className="account-empty" aria-busy="true">
          <p>My trips</p>
          <h3>Loading your trips…</h3>
          <p>Pulling upcoming and past stays from your account.</p>
        </div>
      ) : (
        <div className="account-trips">
          {notice && <p className={notice.includes('Could') ? 'book-error' : 'account-ok'}>{notice}</p>}
          <section>
            <div className="account-trips-head">
              <p>Coming up</p>
              <h2>{upcoming.length} upcoming stay{upcoming.length === 1 ? '' : 's'}</h2>
            </div>
            {upcoming.length === 0 ? (
              <div className="account-empty">
                <h3>No upcoming trips</h3>
                <p>When you confirm a stay on KBC Trip, it appears here as a trip card.</p>
                <Link href="/hotels">Find a stay</Link>
              </div>
            ) : (
              <div className="trip-ticket-list">
                {upcoming.map((booking) => (
                  <TripTicket
                    booking={booking}
                    key={booking.id}
                    onCancelled={(_id, message) => {
                      setNotice(message);
                      if (token && !message.startsWith('Could')) void load(token);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="account-trips-head">
              <p>History</p>
              <h2>Past and cancelled</h2>
            </div>
            {past.length === 0 ? (
              <div className="account-empty account-empty-quiet">
                <p>No past trips yet.</p>
              </div>
            ) : (
              <div className="trip-ticket-list">
                {past.map((booking) => (
                  <TripTicket
                    booking={booking}
                    key={booking.id}
                    onCancelled={(_id, message) => {
                      setNotice(message);
                      if (token && !message.startsWith('Could')) void load(token);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AccountShell>
  );
}
