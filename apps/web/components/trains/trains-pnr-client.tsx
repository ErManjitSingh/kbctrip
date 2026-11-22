'use client';

import { useState } from 'react';
import { Loader2, Ticket } from 'lucide-react';
import { fetchTrainsApi } from '@/lib/trains-client';

export function TrainsPnrClient() {
  const [pnr, setPnr] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [data, setData] = useState<unknown>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const clean = pnr.replace(/\D/g, '');
    if (clean.length !== 10) {
      setMessage('Enter a valid 10-digit PNR');
      setData(null);
      return;
    }
    setBusy(true);
    setMessage('');
    setData(null);
    const res = await fetchTrainsApi(`/api/trains/pnr?pnr=${clean}`);
    setBusy(false);
    if (!res.success) {
      setMessage(res.message || 'Could not fetch PNR status');
      return;
    }
    setData(res.data);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">PNR status</p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#0f294d]">Check your ticket</h1>
        <p className="mt-2 text-sm text-slate-600">Passenger status, chart, and fare from Indian Railways data.</p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">10-digit PNR</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            value={pnr}
            onChange={(event) => setPnr(event.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            placeholder="e.g. 5827194603"
            className="min-w-0 flex-1 rounded-xl border border-[#d7e0ee] px-4 py-3 text-lg font-semibold tracking-wide text-[#0f294d] outline-none focus:border-[#3264ff]"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3264ff] px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            Check
          </button>
        </div>
      </form>

      {message && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      {data != null && (
        <div className="rounded-2xl border border-[#e6ebf2] bg-white p-4 shadow-sm">
          <pre className="max-h-[32rem] overflow-auto text-xs text-slate-700">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
