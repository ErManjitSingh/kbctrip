'use client';

import type { ReactNode } from 'react';

type BadgeTone = 'ok' | 'warn' | 'danger' | 'muted' | 'info' | 'orange';

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'confirmed':
    case 'listed':
    case 'active':
    case 'vip':
    case 'approved':
    case 'completed':
    case 'resolved':
      return 'ok';
    case 'held':
    case 'pending':
    case 'submitted':
    case 'trial':
      return 'warn';
    case 'cancelled':
    case 'unlisted':
    case 'blocked':
    case 'rejected':
    case 'urgent':
      return 'danger';
    case 'refunded':
    case 'open':
      return 'muted';
    case 'marketplace':
      return 'orange';
    default:
      return 'info';
  }
}
