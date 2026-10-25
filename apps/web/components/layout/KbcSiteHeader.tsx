'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BedDouble,
  Car,
  Compass,
  Gift,
  LifeBuoy,
  Menu,
  Plane,
  Tag,
  Ticket,
  TrainFront,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { GuestAuthNav } from '@/components/GuestAuthNav';
import '@/components/layout/kbc-site-header.css';

const NOTE_DISMISS_KEY = 'kbc_note_dismissed';

/** Same offers as the homepage rail — short enough for one line. */
const NOTES = [
  { text: 'Goa hotels · 35% off', href: '/hotels?city=Goa' },
  { text: 'Holiday packages · 25% off', href: '/packages' },
  { text: 'Weekend stays · up to 20% off', href: '/hotels?offers=true' },
] as const;

const NAV_LINKS = [
  { label: 'Hotels', href: '/hotels', detail: 'Stays and rooms', Icon: BedDouble },
  { label: 'Flights', href: '/flights', detail: 'Air routes', Icon: Plane },
  { label: 'Trains', href: '/trains', detail: 'Rail routes', Icon: TrainFront },
  { label: 'Cabs', href: '/cabs', detail: 'Cars and airport', Icon: Car },
  { label: 'Packages', href: '/packages', detail: 'Holiday trips', Icon: Gift },
  { label: 'Activity', href: '/activities', detail: 'Things to do', Icon: Compass },
  { label: 'Offers', href: '/#offers', detail: 'Deals and prices', Icon: Tag },
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
function isActive(pathname: string, href: string) {
  if (href === '/#offers') return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function KbcSiteHeader() {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteOn, setNoteOn] = useState(true);
  const [noteIndex, setNoteIndex] = useState(0);
  const showNote = noteOn && !pathname.startsWith('/cabs');

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(NOTE_DISMISS_KEY) === '1') setNoteOn(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!showNote) return;
    const timer = window.setInterval(() => {
      setNoteIndex((index) => (index + 1) % NOTES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [showNote]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (shouldHideSiteHeader(pathname)) return null;

  const note = NOTES[noteIndex];

  const dismissNote = () => {
    setNoteOn(false);
    try {
      sessionStorage.setItem(NOTE_DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={menuOpen ? 'kbc-chrome is-menu-open' : 'kbc-chrome'}>
      {showNote ? (
        <div className="kbc-note" role="region" aria-label="Current offers">
          <Link className="kbc-note-link" href={note.href}>
            <span className="kbc-note-tag">Offer</span>
            <span className="kbc-note-text" aria-live="polite">{note.text}</span>
            <span className="kbc-note-cta">View</span>
          </Link>
          <button className="kbc-note-x" type="button" aria-label="Dismiss notification" onClick={dismissNote}>
            <X size={14} />
          </button>
        </div>
      ) : null}

      <header className={menuOpen ? 'kbc-site-header is-menu-open' : 'kbc-site-header'}>
        <div className="kbc-site-header-inner page-width">
          <BrandLogo className="brand" />

          <nav className="kbc-site-nav" aria-label="Primary navigation">
            {NAV_LINKS.map((item) => {
              const active = isActive(pathname, item.href);
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
            <Link className="kbc-tool" href="/help">Help</Link>
            <Link className="kbc-tool" href="/account/bookings">My trips</Link>
            <span className="currency">₹ INR</span>
            <GuestAuthNav variant="home" />
            <button
              className="menu-button"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <button className="kbc-menu-backdrop" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <nav className="kbc-site-menu" aria-label="Mobile navigation">
            <div className="kbc-menu-grid">
              {NAV_LINKS.map((item) => {
                const Icon = item.Icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                    <Icon size={18} aria-hidden />
                    <b>{item.label}</b>
                    <small>{item.detail}</small>
                  </Link>
                );
              })}
            </div>
            <div className="kbc-menu-extra">
              <Link href="/help" onClick={() => setMenuOpen(false)}>
                <LifeBuoy size={16} aria-hidden />
                <span>
                  <b>Help</b>
                  <small>Support</small>
                </span>
              </Link>
              <Link href="/account/bookings" onClick={() => setMenuOpen(false)}>
                <Ticket size={16} aria-hidden />
                <span>
                  <b>My trips</b>
                  <small>Find a booking</small>
                </span>
              </Link>
            </div>
            <p className="kbc-menu-currency">Prices shown in ₹ INR</p>
          </nav>
        </>
      ) : null}
    </div>
  );
}
