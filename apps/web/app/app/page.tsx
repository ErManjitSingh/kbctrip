import type { Metadata } from 'next';
import { BedDouble, Briefcase, Bus, Car, Globe, Headphones, Plane, Tag } from 'lucide-react';
import './app-download.css';

export const metadata: Metadata = {
  title: 'Get the app',
  description: 'Get the KBC Trip app for hotel, flight, cab, and holiday package deals.',
};

const APP_STORE_URL = 'https://apps.apple.com/in/search?term=KBC%20Trip';
const PLAY_STORE_URL = 'https://play.google.com/store/search?q=KBC%20Trip&c=apps';

const FEATURES = [
  { label: 'Travel assistant', Icon: Headphones, tone: 'teal' },
  { label: 'App-exclusive deals', Icon: Tag, tone: 'blue' },
  { label: 'Easy trip planning', Icon: Briefcase, tone: 'blue' },
  { label: 'India and beyond', Icon: Globe, tone: 'blue' },
] as const;

export default function AppDownloadPage() {
  return (
    <main className="app-download">
      <div className="app-download-inner">
        <header className="app-download-intro">
          <h1>Get more discounts with the KBC Trip app.</h1>
          <p>Exclusive deals for flights, hotels, cabs, and holiday packages.</p>
        </header>

        <div className="app-download-hero">
          <figure className="app-qr-card">
            <div className="app-qr">
              <img src="/images/kbc-app-qr.svg" alt="" width={148} height={148} />
              <span className="app-qr-mark" aria-hidden>
                <svg viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="9" fill="#10243f" />
                  <path fill="#fff" d="M10.5 8h5.4v8.6L24.2 8h5.8L22 18.2 30.6 28.5H24.6L15.9 19.2V28.5h-5.4V8Z" />
                  <rect x="10.5" y="31.2" width="19" height="2.2" rx="1.1" fill="#2dd4bf" />
                </svg>
              </span>
            </div>
            <figcaption>Scan the QR code</figcaption>
          </figure>

          <div className="app-download-copy">
            <h2>Get more discounts with the KBC Trip app</h2>
            <div className="app-stores">
              <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                <AppleMark />
                <span>
                  <small>Download on the</small>
                  <b>App Store</b>
                </span>
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                <PlayMark />
                <span>
                  <small>Get it on</small>
                  <b>Google Play</b>
                </span>
              </a>
            </div>
            <dl className="app-stats">
              <div>
                <dt>1.2M+</dt>
                <dd>Travellers</dd>
              </div>
              <div>
                <dt>24/7</dt>
                <dd>Support</dd>
              </div>
              <div>
                <dt>6</dt>
                <dd>Ways to book</dd>
              </div>
            </dl>
          </div>

          <AppScene />
        </div>

        <ul className="app-features">
          {FEATURES.map((feature) => {
            const Icon = feature.Icon;
            return (
              <li key={feature.label}>
                <span className={`app-feature-icon is-${feature.tone}`}>
                  <Icon size={28} strokeWidth={1.8} aria-hidden />
                </span>
                {feature.label}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

function AppScene() {
  return (
    <div className="app-scene" aria-hidden>
      <svg className="app-mountains" viewBox="0 0 640 420" preserveAspectRatio="xMaxYMax slice">
        <path fill="#1d4ed8" d="M0 280 120 168l92 74 70-96 118 150 80-70 160 120v94H0Z" opacity="0.55" />
        <path fill="#1e40af" d="M40 320 150 230l70 52 86-110 96 148h238v100H40Z" opacity="0.9" />
        <path fill="#dbeafe" d="M150 230 188 262l32-18Z" />
        <path fill="#dbeafe" d="M306 172 338 214l28-16Z" />
      </svg>

      <svg className="app-person" viewBox="0 0 360 420">
        <ellipse cx="176" cy="392" rx="92" ry="14" fill="#1e3a8a" opacity="0.28" />
        <path d="M118 250c8-46 28-70 58-70s52 24 60 70l18 118H100l18-118Z" fill="#14b8a6" />
        <path d="M128 268c18 10 34 12 52 8 14-3 28 2 40 12l8 18-96 22-18-28 14-32Z" fill="#0f766e" />
        <path d="M154 196c-6 22-2 40 8 52 8-16 10-30 8-46 6 2 14 8 16 18 8-20 2-40-10-52-8 8-16 16-22 28Z" fill="#f6c7a8" />
        <circle cx="176" cy="132" r="40" fill="#f6c7a8" />
        <path d="M140 128c2-36 22-58 48-58 20 0 34 12 40 32 6 4 10 14 8 24-8-6-16-8-26-6-4 16-16 28-32 30-16 2-28-6-34-16-6 2-8 0-4-6Z" fill="#1f2937" />
        <path d="M198 118c10 2 16 10 16 20" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
        <circle cx="166" cy="134" r="3.2" fill="#1f2937" />
        <circle cx="188" cy="134" r="3.2" fill="#1f2937" />
        <path d="M170 150c6 6 14 6 20 0" stroke="#c47b62" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M214 214c28 8 46 28 52 58l-28 10c-8-26-22-40-42-46l18-22Z" fill="#f6c7a8" />
        <rect x="228" y="168" width="58" height="96" rx="10" fill="#f8fafc" transform="rotate(16 257 216)" />
        <rect x="234" y="178" width="46" height="70" rx="6" fill="#38bdf8" transform="rotate(16 257 216)" />
        <circle cx="257" cy="258" r="4" fill="#e2e8f0" transform="rotate(16 257 216)" />
        <path d="M108 286c-24 6-40 24-44 48l26 8c6-18 16-30 34-34l-16-22Z" fill="#f6c7a8" />
      </svg>

      <span className="app-bubble is-plane"><Plane size={22} /></span>
      <span className="app-bubble is-bed"><BedDouble size={22} /></span>
      <span className="app-bubble is-bus"><Bus size={20} /></span>
      <span className="app-bubble is-car"><Car size={20} /></span>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 18 22" aria-hidden width="16" height="20">
      <path fill="currentColor" d="M14.7 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.3c.7-1 1.2-2 1.5-3.1-3.9-1.5-3.8-5.2-3.8-5.3ZM12.6 4.8c.6-.8 1.1-1.9.9-3-1 .1-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.3Z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 20 22" aria-hidden width="18" height="20">
      <path fill="#34a853" d="M1.2 1.4 11.4 11 1.4 20.5c-.3-.4-.4-.9-.4-1.5V2.9c0-.6.1-1.1.2-1.5Z" />
      <path fill="#fbbc04" d="m14.7 8.2-3.3 2.8L1.2 1.4C1.8.7 2.8.5 3.8.9l10.9 7.3Z" />
      <path fill="#ea4335" d="M14.7 13.8 3.8 21c-1 .4-2 .2-2.6-.5L11.4 11l3.3 2.8Z" />
      <path fill="#4285f4" d="m18.4 9.6-3.7-2.4-3.3 2.8 3.3 2.8 3.7-2.4c.8-.5.8-1.4 0-1.8Z" />
    </svg>
  );
}
