'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { AuthFrame } from '../../components/AuthFrame';
import { guestRegister } from '../../lib/booking-api';
import { useGuestAuth } from '../../components/GuestAuthProvider';

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useGuestAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      const session = await guestRegister({ name, email, password, phone: phone || undefined });
      signIn(session.accessToken, session.guest);
      router.push(next.startsWith('/') ? next : '/account');
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Could not create account');
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame
      mode="signup"
      loginHref={`/login${nextQuery}`}
      signupHref={`/signup${nextQuery}`}
      kicker="Join the network"
      title="Create your traveller account"
    >
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        <label>
          Full name
          <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Riya Sharma" />
        </label>
        <div className="auth-form-row">
          <label>
            Email
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
          </label>
          <label>
            Phone
            <input autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" />
          </label>
        </div>
        <label>
          Password
          <span className="auth-password">
            <input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Join KBC Trip'}</button>
      </form>
    </AuthFrame>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="auth-stage" />}>
      <SignupForm />
    </Suspense>
  );
}
