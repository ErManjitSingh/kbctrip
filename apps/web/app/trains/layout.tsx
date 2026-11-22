import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trains | KBC Trip',
  description: 'Search Indian Railways trains, check seat availability, PNR status, and live running info.',
};

export default function TrainsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
