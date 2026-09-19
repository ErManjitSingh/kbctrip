'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { AccountShell } from '../../components/AccountShell';
import { useGuestAuth } from '../../components/GuestAuthProvider';
import { formatPrice, getGuestBookings, updateGuestMe, type GuestBookingSummary } from '../../lib/booking-api';
import { formatStayDay } from '../../lib/stay-search';

export default function AccountPage() {
  const router = useRouter();
  const { ready, guest, token, signIn, signOut } = useGuestAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [nextTrip, setNextTrip] = useState<GuestBookingSummary | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!guest || !token) {
      router.replace('/login?next=/account');
      return;
    }
    setName(guest.name);
    setPhone(guest.phone ?? '');
    void getGuestBookings(token).then((data) => {
      setNextTrip(data?.upcoming[0] ?? null);
    });
  }, [guest, ready, router, token]);

  if (!ready || !guest || !token) {
    return <p className="page-width book-state">Opening your account…</p>;
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateGuestMe(token, { name, phone });
      signIn(token, updated);
      setMessage('Profile saved.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell guest={guest} active="profile">
      <div className="account-layout">
        <form className="account-panel" onSubmit={(event) => void save(event)}>
          <p>Traveller profile</p>
          <h2>Your details for checkout</h2>
          <div className="account-fields">
            <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>Email<input readOnly value={guest.email} /></label>
            <label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" /></label>
          </div>
          {message && <p className={message.includes('saved') ? 'account-ok' : 'auth-error'}>{message}</p>}
          <div className="account-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
            <button type="button" className="account-ghost" onClick={() => { signOut(); router.push('/'); }}>
              Logout
            </button>
          </div>
        </form>

        <aside className="account-side">
          {nextTrip ? (
            <article className="account-next">
              <p>Next stay</p>
              <h2>{nextTrip.property.name}</h2>
              <span><MapPin size={14} /> {nextTrip.property.city ?? 'India'}</span>
              <span><CalendarDays size={14} /> {formatStayDay(nextTrip.checkIn, { weekday: 'short' })} – {formatStayDay(nextTrip.checkOut, { weekday: 'short' })}</span>
              <b>{nextTrip.reference}</b>
              <strong>{formatPrice(nextTrip.totalMinor, nextTrip.property.currency)}</strong>
              <Link href={`/confirmation?slug=${encodeURIComponent(nextTrip.property.slug)}&bookingId=${encodeURIComponent(nextTrip.id)}`}>
                Open ticket <ArrowUpRight size={15} />
              </Link>
            </article>
          ) : (
            <article className="account-next account-next-empty">
              <p>Next stay</p>
              <h2>Nothing booked yet</h2>
              <span>Find a verified stay and it will land here.</span>
              <Link href="/hotels">Browse stays <ArrowUpRight size={15} /></Link>
            </article>
          )}
          <Link className="account-side-link" href="/account/bookings">See all trips</Link>
        </aside>
      </div>
    </AccountShell>
  );
}
