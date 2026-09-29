import Link from 'next/link';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  body: string;
  href?: string;
  actionLabel?: string;
  className?: string;
};

export function EmptyState({ title, body, href, actionLabel, className }: EmptyStateProps) {
  return (
    <div className={cn('kbc-empty', className)}>
      <strong>{title}</strong>
      <p>{body}</p>
      {href && actionLabel ? (
        <Link
          href={href}
          className="mt-2 inline-flex min-h-11 items-center rounded-full bg-[var(--kbc-ink)] px-5 text-sm font-bold text-white transition hover:bg-[var(--kbc-teal)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
