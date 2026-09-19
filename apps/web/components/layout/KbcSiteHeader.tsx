'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Globe2, Menu } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { GuestAuthNav } from '@/components/GuestAuthNav';
import '@/components/layout/kbc-site-header.css';

const NAV_LINKS = [
  { label: 'Hotels', href: '/hotels' },
  { label: 'Flights', href: '/flights' },
  { label: 'Trains', href: '/trains' },
  { label: 'Buses', href: '/bus' },
  { label: 'Cabs', href: '/cabs' },
  { label: 'Packages', href: '/packages' },
  { label: 'Offers', href: '/#offers' },
] as const;

/** Routes that keep their own chrome (partner / ops shells). */
function shouldHideSiteHeader(pathname: string) {
  return (
    pathname.startsWith('/cabs/partner') ||
    pathname.startsWith('/partner') ||
    pathname.startsWith('/admin')
  );
}

/**
 * Single site header — same topbar as the KBC Trip homepage.
 */
export function KbcSiteHeader() {
  const pathname = usePathname() || '/';
  if (shouldHideSiteHeader(pathname)) return null;

  return (
    <header className="kbc-site-header">
      <div className="kbc-site-header-inner page-width">
        <BrandLogo className="brand" />

        <nav className="kbc-site-nav" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => {
            const active =
              item.href !== '/#offers' &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'is-active' : undefined}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="kbc-site-header-actions">
          <button className="currency" type="button">
            <Globe2 size={14} /> INR <ChevronDown size={12} />
          </button>
          <GuestAuthNav variant="home" />
          <button className="menu-button" type="button" aria-label="Open menu">
            <Menu size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
