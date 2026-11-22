'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';
import { fetchTrainsApi, IRCTC_BOOK_URL } from '@/lib/trains-client';

export function TrainDetailClient({ number }: { number: string }) {
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setMessage('');
    void fetchTrainsApi(`/api/trains/train/${number}`)
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setMessage(res.message || 'Could not load train');
          return;
        }
        setData(res.data);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [number]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/trains" className="text-sm font-semibold text-[#3264ff]">← Back to trains</Link>
          <h1 className="mt-2 text-3xl font-extrabold text-[#0f294d]">Train {number}</h1>
          <p className="mt-1 text-sm text-slate-600">Route and schedule from Indian Railways data.</p>
        </div>
        <a
          href={IRCTC_BOOK_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-white"
        >
          Book on IRCTC
          <ExternalLink size={14} />
        </a>
      </div>

      {busy && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#e6ebf2] bg-white p-5 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-[#3264ff]" />
          Loading train info…
        </div>
      )}

      {message && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      {data != null && (
        <div className="rounded-2xl border border-[#e6ebf2] bg-white p-4 shadow-sm">
          <pre className="max-h-[40rem] overflow-auto text-xs text-slate-700">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
