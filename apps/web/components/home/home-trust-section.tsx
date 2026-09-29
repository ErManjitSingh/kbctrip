import { ShieldCheck, Star, Users } from 'lucide-react';

const points = [
  { icon: ShieldCheck, title: 'Verified partners', body: 'Stays, packages, and cab partners you can trust.' },
  { icon: Star, title: 'Clear pricing', body: 'Compare options before you commit — no opaque fares.' },
  { icon: Users, title: 'One account', body: 'Book and manage hotels, packages, and cabs together.' },
] as const;

export function HomeTrustSection() {
  return (
    <section className="home-band home-band-trust" aria-labelledby="home-trust-title">
      <div className="page-width">
        <div className="home-trust-layout">
          <div className="home-trust-copy">
            <p className="section-kicker">Why KBC Trip</p>
            <h2 id="home-trust-title">Travel that stays simple</h2>
            <p className="home-section-lead">
              Built for India-first trips — private stays, considered packages, and cab quotes in one place.
            </p>
          </div>
          <ul className="home-trust-grid">
            {points.map((point) => (
              <li key={point.title}>
                <span className="home-trust-icon" aria-hidden>
                  <point.icon size={18} />
                </span>
                <strong>{point.title}</strong>
                <p>{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
