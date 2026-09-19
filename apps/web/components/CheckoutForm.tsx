'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, ShieldCheck, Users } from 'lucide-react';
import { createHold, formatPrice, getAvailability, getExperiences, getPackages, getPaidServices } from '../lib/booking-api';
import { formatStayDay, guestLabel, stayHref, type StayQuery } from '../lib/stay-search';
import { useGuestAuth } from './GuestAuthProvider';

type CheckoutFormProps = {
  slug: string;
  stay: StayQuery;
  roomTypeId: string;
  ratePlanId: string;
  propertyName: string;
  propertyCity: string | null;
};

export function CheckoutForm({ slug, stay, roomTypeId, ratePlanId, propertyName, propertyCity }: CheckoutFormProps) {
  const router = useRouter();
  const { guest, token } = useGuestAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('Selected room');
  const [planName, setPlanName] = useState('Selected rate');
  const [currency, setCurrency] = useState('INR');
  const [nights, setNights] = useState(1);
  const [roomTotal, setRoomTotal] = useState<number | null>(null);
  const [packages, setPackages] = useState<{ id: string; name: string; description: string | null; priceMinor: number }[]>([]);
  const [addons, setAddons] = useState<{ id: string; name: string; description: string | null; priceMinor: number }[]>([]);
  const [experiences, setExperiences] = useState<{ id: string; name: string; description: string | null; priceMinor: number }[]>([]);
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [experienceIds, setExperienceIds] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const loginHref = `/login?next=${encodeURIComponent(stayHref(`/hotels/${slug}/checkout`, stay, { roomTypeId, ratePlanId }))}`;

  useEffect(() => {
    if (!guest) return;
    const [first, ...rest] = guest.name.split(' ');
    setFirstName((current) => current || first || '');
    setLastName((current) => current || rest.join(' '));
    setEmail((current) => current || guest.email);
    setPhone((current) => current || guest.phone || '');
  }, [guest]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAvailability(slug, stay.checkIn, stay.checkOut, stay.adults, stay.children),
      getPackages(slug),
      getPaidServices(slug),
      getExperiences(slug),
    ]).then(([availability, packageOptions, addonOptions, experienceOptions]) => {
      if (cancelled) return;
      const room = availability?.rooms.find((item) => item.roomTypeId === roomTypeId);
      const plan = room?.ratePlans.find((item) => item.ratePlanId === ratePlanId);
      if (room) setRoomName(room.name);
      if (plan) {
        setPlanName(plan.name);
        setRoomTotal(plan.totalMinor);
      }
      setNights(availability?.nights ?? 1);
      setCurrency(availability?.property.currency ?? 'INR');
      setPackages(packageOptions ?? []);
      setAddons(addonOptions ?? []);
      setExperiences(experienceOptions ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ratePlanId, roomTypeId, slug, stay.adults, stay.checkIn, stay.checkOut, stay.children]);

  const extrasTotal = useMemo(() => {
    const pick = (items: { id: string; priceMinor: number }[], ids: string[]) =>
      items.filter((item) => ids.includes(item.id)).reduce((sum, item) => sum + item.priceMinor, 0);
    return pick(packages, packageIds) + pick(addons, addonIds) + pick(experiences, experienceIds);
  }, [addonIds, addons, experienceIds, experiences, packageIds, packages]);

  const toggle = (id: string, selected: string[], setSelected: (value: string[]) => void) => {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError('Sign in to continue booking');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const hold = await createHold(
        slug,
        {
          roomTypeId,
          ratePlanId,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          adults: stay.adults,
          children: stay.children,
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          email: email.trim(),
          phone: phone.trim() || undefined,
          packageIds,
          addonIds,
          experienceIds,
        },
        token
      );
      router.push(`/pay?slug=${encodeURIComponent(slug)}&bookingId=${encodeURIComponent(hold.bookingId)}`);
    } catch (holdError) {
      setError(holdError instanceof Error ? holdError.message : 'Could not hold this stay');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="book-state">Preparing your stay…</p>;
  }

  if (!roomTypeId || !ratePlanId) {
    return (
      <div className="book-empty">
        <h2>Choose a room first</h2>
        <p>Pick a room and rate from the hotel page to continue checkout.</p>
        <Link href={stayHref(`/hotels/${slug}`, stay)}>Back to hotel</Link>
      </div>
    );
  }

  if (!guest || !token) {
    return (
      <div className="book-empty">
        <h2>Sign in to book</h2>
        <p>Sign in so this stay is saved to My trips and shows as a KBC Trip booking for the hotel.</p>
        <Link href={loginHref}>Sign in to continue</Link>
        <p className="book-note" style={{ marginTop: 12 }}>
          New here? <Link href={`/signup?next=${encodeURIComponent(stayHref(`/hotels/${slug}/checkout`, stay, { roomTypeId, ratePlanId }))}`}>Create an account</Link>
        </p>
      </div>
    );
  }

  return (
    <form className="book-layout" onSubmit={(event) => void submit(event)}>
      <section className="book-main">
        <article className="book-panel">
          <div className="book-panel-head">
            <p>Guest details</p>
            <h2>Who is staying?</h2>
          </div>
          <p className="book-note">Signed in as {guest.email}. You can still edit the stay contact.</p>
          <div className="book-fields">
            <label>First name<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Riya" /></label>
            <label>Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Sharma" /></label>
            <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" /></label>
            <label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" /></label>
          </div>
        </article>

        {[
          { title: 'Stay packages', hint: 'Bundle extras into the stay', items: packages, selected: packageIds, setSelected: setPackageIds },
          { title: 'Paid services', hint: 'Add-ons at the property', items: addons, selected: addonIds, setSelected: setAddonIds },
          { title: 'Experiences', hint: 'Things to do nearby', items: experiences, selected: experienceIds, setSelected: setExperienceIds },
        ].map((group) =>
          group.items.length > 0 ? (
            <article className="book-panel" key={group.title}>
              <div className="book-panel-head">
                <p>{group.hint}</p>
                <h2>{group.title}</h2>
              </div>
              <div className="book-extras">
                {group.items.map((item) => {
                  const on = group.selected.includes(item.id);
                  return (
                    <label className={on ? 'on' : undefined} key={item.id}>
                      <input type="checkbox" checked={on} onChange={() => toggle(item.id, group.selected, group.setSelected)} />
                      <span>
                        <b>{item.name}</b>
                        <small>{item.description ?? 'Add this to your stay'}</small>
                      </span>
                      <strong>{formatPrice(item.priceMinor, currency)}</strong>
                    </label>
                  );
                })}
              </div>
            </article>
          ) : null
        )}
      </section>

      <aside className="book-summary">
        <p>Stay folio</p>
        <h2>{propertyName}</h2>
        {propertyCity && <span className="book-summary-city">{propertyCity}</span>}
        <b className="book-summary-room">{roomName}</b>
        <small>{planName}</small>
        <div className="book-summary-dates">
          <div>
            <small>Check-in</small>
            <strong>{formatStayDay(stay.checkIn, { weekday: 'short' })}</strong>
          </div>
          <div>
            <small>Check-out</small>
            <strong>{formatStayDay(stay.checkOut, { weekday: 'short' })}</strong>
          </div>
        </div>
        <div className="book-summary-meta">
          <span><CalendarDays size={14} /> {nights} night{nights === 1 ? '' : 's'}</span>
          <span><Users size={14} /> {guestLabel(stay)}</span>
        </div>
        <div className="book-lines">
          <div><span>Room</span><b>{formatPrice(roomTotal, currency)}</b></div>
          {extrasTotal > 0 && <div><span>Extras</span><b>{formatPrice(extrasTotal, currency)}</b></div>}
        </div>
        <div className="book-due">
          <span>Due at pay</span>
          <strong>{formatPrice((roomTotal ?? 0) + extrasTotal, currency)}</strong>
        </div>
        {error && <p className="book-error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Holding stay…' : 'Continue to pay'}</button>
        <small className="book-hold-note"><ShieldCheck size={13} /> Room held for 10 minutes while you pay. No charge yet.</small>
      </aside>
    </form>
  );
}
