'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { BookFlowShell } from '../../components/BookFlowShell';
import { confirmBooking, formatPrice, getBooking, type BookingView } from '../../lib/booking-api';
import { formatStayDay } from '../../lib/stay-search';

function PayPanel() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get('slug') ?? '';
  const bookingId = params.get('bookingId') ?? '';
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !bookingId) {
      setLoading(false);
      return;
    }
    void getBooking(slug, bookingId).then((data) => {
      setBooking(data);
      setLoading(false);
    });
  }, [bookingId, slug]);

  const pay = async () => {
    if (!slug || !bookingId) return;
    setPaying(true);
    setError(null);
    try {
      await confirmBooking(slug, bookingId);
      router.push(`/confirmation?slug=${encodeURIComponent(slug)}&bookingId=${encodeURIComponent(bookingId)}`);
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : 'Payment failed');
      setPaying(false);
    }
  };

  if (loading) return <p className="book-state">Loading your hold…</p>;
  if (!booking) {
    return (
      <div className="book-empty">
        <h2>Hold not found</h2>
        <p>The 10-minute hold may have expired. Choose a room again to continue.</p>
        <Link href={slug ? `/hotels/${slug}` : '/hotels'}>Back to hotel</Link>
      </div>
    );
  }

  return (
    <div className="book-pay">
      <article className="book-panel book-hold-card">
        <div className="book-panel-head">
          <p>Held reservation</p>
          <h2>{booking.property?.name ?? 'Your stay'}</h2>
        </div>
        <div className="book-lines">
          <div><span>Reference</span><b>{booking.reference}</b></div>
          <div><span>Room</span><b>{booking.roomType}</b></div>
          <div>
            <span>Dates</span>
            <b>{formatStayDay(booking.checkIn, { weekday: 'short' })} → {formatStayDay(booking.checkOut, { weekday: 'short' })}</b>
          </div>
          <div><span>Guest</span><b>{booking.guestName || '—'}</b></div>
        </div>
        <div className="book-due">
          <span>Amount due</span>
          <strong>{formatPrice(booking.totalMinor, booking.property?.currency)}</strong>
        </div>
      </article>

      <article className="book-panel book-card-panel">
        <div className="book-panel-head">
          <p>Test card</p>
          <h2>Pay like the front desk</h2>
        </div>
        <div className="book-visa" aria-hidden="true">
          <span>KBC Trip</span>
          <strong>4111 1111 1111 1111</strong>
          <div>
            <small>VALID 12/26</small>
            <b>VISA</b>
          </div>
        </div>
        <label>Card number
          <span className="book-fake-input"><CreditCard size={16} /> 4111 1111 1111 1111</span>
        </label>
        <div className="book-fields">
          <label>Expiry<input readOnly value="12/26" /></label>
          <label>CVV<input readOnly value="***" /></label>
        </div>
        <p className="book-warning">Test mode — no real charge. This confirms the held booking.</p>
        {error && <p className="book-error">{error}</p>}
        <button type="button" onClick={() => void pay()} disabled={paying}>
          <Lock size={15} /> {paying ? 'Processing…' : `Pay ${formatPrice(booking.totalMinor, booking.property?.currency)}`}
        </button>
        <div className="book-pay-trust">
          <span><ShieldCheck size={13} /> 256-bit SSL</span>
          <span>Mock capture</span>
          <span>Instant confirm</span>
        </div>
      </article>
    </div>
  );
}

export default function PayPage() {
  return (
    <BookFlowShell step={2} kicker="Secure payment" title="Pay and lock the room" backHref="/hotels" backLabel="Back to stays">
      <Suspense fallback={<p className="book-state">Loading payment…</p>}>
        <PayPanel />
      </Suspense>
    </BookFlowShell>
  );
}
