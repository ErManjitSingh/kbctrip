import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { CatalogHeader } from './CatalogHeader';
import { SiteFooter } from './SiteFooter';

const copy: Record<string, { kicker: string; title: string; body: string; photo: string; waitlist: string }> = {
  flights: {
    kicker: 'Air inventory',
    title: 'Flights that sit next to your stay.',
    body: 'Same search, same itinerary. Live fares land here after hotel booking is locked in.',
    photo: 'dubai-bg.png',
    waitlist: 'Notify me when flights open',
  },
  trains: {
    kicker: 'Rail inventory',
    title: 'Sleeper to summit, one ticket wallet.',
    body: 'IRCTC-style search will share the same guest account and trip ticket as your hotel.',
    photo: 'jaipur-bg.png',
    waitlist: 'Notify me when trains open',
  },
  buses: {
    kicker: 'Coach inventory',
    title: 'Overnight coaches, same trip ticket.',
    body: 'City-to-city buses will book into My trips the moment hotel holds are proven.',
    photo: 'manali-bg.png',
    waitlist: 'Notify me when buses open',
  },
  cabs: {
    kicker: 'Ground inventory',
    title: 'Airport to hotel without a second app.',
    body: 'Airport transfers will attach to the stay you just confirmed.',
    photo: 'goa-bg.png',
    waitlist: 'Notify me when cabs open',
  },
  packages: {
    kicker: 'Curated trips',
    title: 'Hotel + move + moments, packed.',
    body: 'Bundles will price against the same HomeyHuts inventory you already book today.',
    photo: 'kashmir-bg.png',
    waitlist: 'Notify me when packages open',
  },
  about: {
    kicker: 'The house',
    title: 'One wallet for every journey.',
    body: 'KBC Trip is the guest face of KBC Booking. Hotels are live. The rest of the stack is coming in on the same account.',
    photo: 'goa-bg.png',
    waitlist: 'Hotels are live today',
  },
  help: {
    kicker: 'Support',
    title: 'Help that follows the ticket.',
    body: 'Manage a stay from My trips, or write hello@kbctrip.com. Cancellation uses the hotel’s rate policy.',
    photo: 'kashmir-bg.png',
    waitlist: 'Open My trips to manage a booking',
  },
  cancellation: {
    kicker: 'Policies',
    title: 'Cancel before check-in. Policy decides the refund.',
    body: 'Upcoming confirmed stays can be cancelled from My trips. Refunds follow the hotel rate plan and stay mocked until Razorpay is live.',
    photo: 'jaipur-bg.png',
    waitlist: 'Cancel from My trips',
  },
};

export function ComingSoon({ product }: { product: string }) {
  const key = product.toLowerCase();
  const page = copy[key] ?? {
    kicker: 'Coming next',
    title: `${product.charAt(0).toUpperCase()}${product.slice(1)} is on the runway.`,
    body: 'Hotels are live. This lane joins the same guest account and trip wallet.',
    photo: 'goa-bg.png',
    waitlist: 'Notify me when this opens',
  };
  const nav = key === 'flights' || key === 'packages' ? (key === 'flights' ? 'Flights' : 'Packages') : 'Home';

  return (
    <>
      <main className="discover-page">
        <CatalogHeader active={nav} />
        <section className="soon-hero">
          <div
            className="soon-hero-photo"
            style={{ backgroundImage: `url('/reference/destination-backgrounds/${page.photo}')` }}
            aria-hidden="true"
          />
          <div className="page-width soon-hero-inner">
            <p><BadgeCheck size={15} /> {page.kicker}</p>
            <h1>{page.title}</h1>
            <span>{page.body}</span>
            <div className="soon-actions">
              <Link href="/hotels">
                Book a stay now <ArrowRight size={16} />
              </Link>
              <em>{page.waitlist}</em>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
