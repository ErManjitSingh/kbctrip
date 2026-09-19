'use client';

import { Suspense } from 'react';
import HotelsInner from './HotelsInner';
import { Spinner } from '@/components/ui/Primitives';

export default function HotelsPage() {
  return (
    <Suspense fallback={<Spinner label="Loading hotels…" />}>
      <HotelsInner />
    </Suspense>
  );
}
