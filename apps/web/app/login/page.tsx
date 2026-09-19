'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { AuthFrame } from '../../components/AuthFrame';
import { guestLogin } from '../../lib/booking-api';
import { useGuestAuth } from '../../components/GuestAuthProvider';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useGuestAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const next = params.get('next') || '/account';
  const nextQuery = next !== '/account' ? `?next=${encodeURIComponent(next)}` : '';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const session = await guestLogin({ email, password });
      signIn(session.accessToken, session.guest);
      router.push(next.startsWith('/') ? next : '/account');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in');
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame
      mode="login"
      loginHref={`/login${nextQuery}`}
      signupHref={`/signup${nextQuery}`}
      kicker="Welcome back"
      title="Sign in to continue your trip"
    >
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        <label>
          Email
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
        </label>
        <label>
          Password
          <span className="auth-password">
            <input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Signing you in…' : 'Continue'}</button>
      </form>
      <button type="button" className="auth-demo" onClick={() => { setEmail('guest@kbctrip.test'); setPassword('Demo@123'); }}>
        Fill demo traveller
      </button>
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-stage" />}>
      <LoginForm />
    </Suspense>
  );
}
