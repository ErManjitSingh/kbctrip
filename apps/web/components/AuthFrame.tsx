import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function AuthFrame({
  mode,
  loginHref,
  signupHref,
  kicker,
  title,
  children,
}: {
  mode: 'login' | 'signup';
  loginHref: string;
  signupHref: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-stage">
      <Image
        className="auth-stage-photo"
        src="/reference/destination-backgrounds/goa-bg.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
      />
      <div className="auth-stage-scrim" />
      <div className="auth-stage-glow" aria-hidden="true" />

      <header className="auth-stage-top">
        <BrandLogo tone="light" className="auth-stage-brand" />
        <Link href="/" className="auth-stage-back">
          <ArrowLeft size={15} /> Back to home
        </Link>
      </header>

      <section className="auth-stage-grid">
        <div className="auth-stage-copy">
          <p>{kicker}</p>
          <h1>
            Book everything.
            <em> Remember the feeling.</em>
          </h1>
          <div className="auth-stage-proof">
            <span><Star size={13} fill="currentColor" /> 4.8 guest score</span>
            <span>1.2M travellers</span>
            <span>KBC verified stays</span>
          </div>
          <figure className="auth-quote">
            <blockquote>Travel made our vacation so easy. Hotels, cabs and the itinerary all sat in one place.</blockquote>
            <figcaption>Riya Sharma · Mumbai</figcaption>
          </figure>
        </div>

        <div className="auth-glass">
          <div className="auth-tabs" role="tablist">
            <Link className={mode === 'login' ? 'on' : undefined} href={loginHref}>
              Sign in
            </Link>
            <Link className={mode === 'signup' ? 'on' : undefined} href={signupHref}>
              Join KBC Trip
            </Link>
          </div>
          <h2>{title}</h2>
          {children}
        </div>
      </section>
    </main>
  );
}
