import Link from 'next/link';
import { CatalogHeader } from './CatalogHeader';
import { SiteFooter } from './SiteFooter';
import type { GuestProfile } from '../lib/booking-api';

export function AccountShell({
  guest,
  active,
  children,
}: {
  guest: GuestProfile;
  active: 'profile' | 'trips';
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="discover-page">
        <CatalogHeader active="Account" />
        <section className="account-hero">
          <div className="account-hero-photo" aria-hidden="true" />
          <div className="page-width account-hero-inner">
            <p>My account</p>
            <div className="account-hero-row">
              <div className="account-identity">
                <b>{guest.name.slice(0, 1).toUpperCase()}</b>
                <div>
                  <h1>{guest.name}</h1>
                  <span>{guest.email}</span>
                </div>
              </div>
              <nav className="account-tabs" aria-label="Account sections">
                <Link className={active === 'profile' ? 'on' : undefined} href="/account">
                  Profile
                </Link>
                <Link className={active === 'trips' ? 'on' : undefined} href="/account/bookings">
                  My trips
                </Link>
              </nav>
            </div>
          </div>
        </section>
        <section className="page-width account-body">{children}</section>
      </main>
      <SiteFooter />
    </>
  );
}
