import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'light';
  wordmark?: boolean;
};

const sizes = {
  sm: { box: 28, type: 16, gap: 9 },
  md: { box: 32, type: 18, gap: 10 },
  lg: { box: 40, type: 22, gap: 12 },
} as const;

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
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" className="kbc-logo-plate" />
        <path
          className="kbc-logo-k"
          d="M9 6.8h3.7v6.85L19.7 6.8H24l-7.45 8L24.15 24.2H19.85l-7.15-8.25V24.2H9V6.8Z"
        />
        <path
          className="kbc-logo-accent"
          d="M9 26.35h14"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );

  const label = wordmark ? (
    <span className="kbc-logo-word" style={{ fontSize: dim.type }}>
      <b>KBC</b>
      <em>Trip</em>
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
