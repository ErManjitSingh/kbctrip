'use client';

import { useState, type FormEvent } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { login, apiOnline } = useAuth();
  const [email, setEmail] = useState('superadmin@platform.test');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Is the booking API running on :4000?',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-visual" aria-hidden="true">
        <BrandLogo href="" tone="light" size="md" />
        <div>
          <h2>Run the marketplace from one quiet console.</h2>
          <p>
            Bookings, supply, guests, and homepage content — built for platform ops, not hotel front desks.
          </p>
        </div>
        <div className="login-visual-foot">
          <span>Live auth</span>
          <span>Supply queue</span>
          <span>Trip brand</span>
        </div>
      </section>

      <div className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <BrandLogo href="" size="md" />
          <h1>Platform ops</h1>
          <p>Sign in with a platform super-admin account from the booking API.</p>

          {apiOnline === false ? (
            <p className="login-error" role="status">
              Booking API looks offline. Start Nest on :4000, then retry.
            </p>
          ) : null}
          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="login-hint">Demo: superadmin@platform.test / Demo@123</p>
        </form>
      </div>
    </div>
  );
}
