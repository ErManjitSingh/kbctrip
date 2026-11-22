'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Loader2, TrainFront } from 'lucide-react';
import { fetchTrainsApi } from '@/lib/trains-client';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TrainsLiveClient() {
  const [station, setStation] = useState('NDLS');
  const [hours, setHours] = useState<2 | 4 | 8>(2);
  const [trainNo, setTrainNo] = useState('');
  const [date, setDate] = useState(todayIso());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [board, setBoard] = useState<unknown>(null);
  const [track, setTrack] = useState<unknown>(null);

  async function loadBoard(event: React.FormEvent) {
    event.preventDefault();
    const code = station.trim().toUpperCase();
    if (!code) {
      setMessage('Enter a station code');
      return;
    }
    setBusy(true);
    setMessage('');
    setBoard(null);
    const res = await fetchTrainsApi(`/api/trains/station/${encodeURIComponent(code)}/live?hours=${hours}`);
    setBusy(false);
    if (!res.success) {
      setMessage(res.message || 'Could not load station board');
      return;
    }
    setBoard(res.data);
  }

  async function loadTrack(event: React.FormEvent) {
    event.preventDefault();
    const number = trainNo.replace(/\D/g, '');
    if (number.length !== 5) {
      setMessage('Enter a valid 5-digit train number');
      return;
    }
    setBusy(true);
    setMessage('');
    setTrack(null);
    const res = await fetchTrainsApi(`/api/trains/train/${number}?date=${encodeURIComponent(date)}`);
    setBusy(false);
    if (!res.success) {
      setMessage(res.message || 'Could not track train');
      return;
    }
    setTrack(res.data);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Live tools</p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#0f294d]">Station board & train track</h1>
      </div>

      {message && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={loadBoard} className="rounded-2xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#0f294d]">
            <Activity className="h-5 w-5 text-[#16a34a]" />
            Live at station
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={station}
              onChange={(event) => setStation(event.target.value.toUpperCase())}
              placeholder="NDLS"
              className="rounded-xl border border-[#d7e0ee] px-3 py-2.5 font-semibold uppercase outline-none focus:border-[#3264ff]"
            />
            <select
              value={hours}
              onChange={(event) => setHours(Number(event.target.value) as 2 | 4 | 8)}
              className="rounded-xl border border-[#d7e0ee] px-3 py-2.5"
            >
              <option value={2}>2h</option>
              <option value={4}>4h</option>
              <option value={8}>8h</option>
            </select>
            <button type="submit" disabled={busy} className="rounded-xl bg-[#16a34a] px-4 py-2.5 font-bold text-white disabled:opacity-60">
              {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Load'}
            </button>
          </div>
          {board != null && (
            <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-[#f8fafc] p-3 text-xs text-slate-700">
              {JSON.stringify(board, null, 2)}
            </pre>
          )}
        </form>

        <form onSubmit={loadTrack} className="rounded-2xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#0f294d]">
            <TrainFront className="h-5 w-5 text-[#3264ff]" />
            Track train
          </div>
          <div className="mt-4 grid gap-3">
            <input
              value={trainNo}
              onChange={(event) => setTrainNo(event.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="12301"
              className="rounded-xl border border-[#d7e0ee] px-3 py-2.5 font-semibold outline-none focus:border-[#3264ff]"
            />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl border border-[#d7e0ee] px-3 py-2.5 outline-none focus:border-[#3264ff]"
            />
            <button type="submit" disabled={busy} className="rounded-xl bg-[#3264ff] px-4 py-2.5 font-bold text-white disabled:opacity-60">
              {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Track'}
            </button>
            {trainNo.length === 5 && (
              <Link href={`/trains/${trainNo}`} className="text-sm font-semibold text-[#3264ff]">
                Open train details →
              </Link>
            )}
          </div>
          {track != null && (
            <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-[#f8fafc] p-3 text-xs text-slate-700">
              {JSON.stringify(track, null, 2)}
            </pre>
          )}
        </form>
      </div>
    </div>
  );
}
