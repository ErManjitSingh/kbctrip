'use client';

import Link from 'next/link';
import { useGuestAuth } from './GuestAuthProvider';

export function GuestAuthNav({ variant = 'catalog' }: { variant?: 'home' | 'catalog' }) {
  const { ready, guest, signOut } = useGuestAuth();

  if (!ready) {
    return <span className={variant === 'home' ? 'login-button' : 'auth-chip'}>…</span>;
  }

  if (guest) {
    return (
      <div className={`auth-session ${variant === 'home' ? 'auth-session-home' : ''}`}>
        <Link href="/account" className="auth-avatar" aria-label="Open My account">
          <b>{guest.name.slice(0, 1).toUpperCase()}</b>
          <span>{guest.name.split(' ')[0]}</span>
        </Link>
        <Link href="/account/bookings">My trips</Link>
        <button type="button" onClick={signOut}>
          Logout
        </button>
      </div>
    );
  }

  if (variant === 'home') {
    return (
      <Link href="/login" className="login-button">
        Sign in
      </Link>
    );
  }

  return (
    <Link href="/login" className="auth-chip">
      Sign in
    </Link>
  );
}
