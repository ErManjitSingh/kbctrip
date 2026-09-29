import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  kicker: string;
  title: string;
  lead?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  className?: string;
  dark?: boolean;
};

export function SectionHeader({
  kicker,
  title,
  lead,
  href,
  linkLabel,
  align = 'left',
  className,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-7 flex gap-5',
        align === 'center' ? 'flex-col items-center text-center' : 'items-end justify-between',
        className,
      )}
    >
      <div>
        <p className={cn('kbc-section-kicker', dark && 'text-teal-300')}>{kicker}</p>
        <h2 className={cn('kbc-section-title', dark && 'text-white')}>{title}</h2>
        {lead ? (
          <p className={cn('kbc-section-lead', dark && 'text-white/70', align === 'center' && 'mx-auto')}>
            {lead}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors',
            dark ? 'text-teal-300 hover:text-white' : 'text-teal-800 hover:text-teal-950',
          )}
        >
          {linkLabel}
          <ArrowRight size={15} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
