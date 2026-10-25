'use client';

import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'light';
  wordmark?: boolean;
};

const sizes = {
  sm: { box: 28, type: 15.5, gap: 10 },
  md: { box: 34, type: 18, gap: 11 },
  lg: { box: 42, type: 22, gap: 12 },
} as const;

/** Ink plate + white K + teal rule. Footer inverts plate. */
function LogoMark({ tone }: { tone: 'ink' | 'light' }) {
  const plate = tone === 'light' ? '#ffffff' : '#0c1210';
  const letter = tone === 'light' ? '#0c1210' : '#ffffff';
  const rule = tone === 'light' ? '#2dd4bf' : '#0f766e';

  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="40" height="40" rx="9" fill={plate} />
      <path
        fill={letter}
        d="M10.5 8h5.4v8.6L24.2 8h5.8L22 18.2 30.6 28.5H24.6L15.9 19.2V28.5h-5.4V8Z"
      />
      <rect x="10.5" y="31.2" width="19" height="2.2" rx="1.1" fill={rule} />
    </svg>
  );
}

export function BrandLogo({
  href = '/',
  className = '',
  size = 'md',
  tone = 'ink',
  wordmark = true,
}: BrandLogoProps) {
  const dim = sizes[size];
  const classes = ['kbc-logo', `kbc-logo-${tone}`, className].filter(Boolean).join(' ');

  const mark = (
    <span className="kbc-logo-mark" aria-hidden="true" style={{ width: dim.box, height: dim.box }}>
      <LogoMark tone={tone} />
    </span>
  );

  const label = wordmark ? (
    <span className="kbc-logo-word" style={{ fontSize: dim.type }}>
      <b>KBC</b>
      <span>Trip</span>
    </span>
  ) : (
    <span className="sr-only">KBC Trip</span>
  );

  if (!href) {
    return (
      <span className={classes} style={{ gap: dim.gap }}>
        {mark}
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={classes} style={{ gap: dim.gap }} aria-label="KBC Trip home">
      {mark}
      {label}
    </Link>
  );
}
