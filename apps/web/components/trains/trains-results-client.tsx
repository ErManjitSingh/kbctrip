'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, TrainFront } from 'lucide-react';
import { TrainSearchBar } from '@/components/trains/TrainSearchBar';
import { fetchTrainsApi, formatIsoToDisplay, IRCTC_BOOK_URL } from '@/lib/trains-client';

type Props = {
  from: string;
  to: string;
  date: string;
  coachClass: string;
};

type TrainRow = Record<string, unknown>;

type SeatPayload = {
  availability?: unknown;
  fare?: unknown;
  error?: string;
};

function asList(payload: unknown): TrainRow[] {
  if (Array.isArray(payload)) return payload as TrainRow[];
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.data)) return root.data as TrainRow[];
  const nested = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  for (const key of ['trains', 'trainBtwnStnsList', 'list', 'results', 'data']) {
    const value = nested[key];
    if (Array.isArray(value)) return value as TrainRow[];
  }
  return [];
}

function trainNumber(row: TrainRow): string {
  const value = row.trainNumber ?? row.train_number ?? row.trainNo ?? row.train_no ?? row.number;
  return String(value ?? '').replace(/\D/g, '').slice(0, 5);
}

function trainName(row: TrainRow): string {
  return String(row.trainName ?? row.train_name ?? row.name ?? 'Train');
}

function field(row: TrainRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim()) return String(value);
  }
  return '—';
}

function stationCode(row: TrainRow, side: 'from' | 'to', fallback: string) {
  const keys =
    side === 'from'
      ? ['from_stn_code', 'fromStnCode', 'from']
      : ['to_stn_code', 'toStnCode', 'to'];
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim()) return String(value).trim().toUpperCase();
  }
  return fallback.toUpperCase();
}

function unwrap(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  if (root.success === false) return root;
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

function money(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function SeatSummary({ info, coach }: { info: SeatPayload | null; coach: string }) {
  if (!info) return null;
  if (info.error) {
    return <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{info.error}</p>;
  }

  const availEnvelope = info.availability && typeof info.availability === 'object'
    ? (info.availability as Record<string, unknown>)
    : null;
  const fareEnvelope = info.fare && typeof info.fare === 'object'
    ? (info.fare as Record<string, unknown>)
    : null;

  const availError =
    availEnvelope && availEnvelope.success === false
      ? String(availEnvelope.error || availEnvelope.message || 'Availability unavailable')
      : typeof info.availability === 'string'
        ? info.availability
        : null;
  const fareError =
    fareEnvelope && fareEnvelope.success === false
      ? String(fareEnvelope.error || fareEnvelope.message || 'Fare unavailable')
      : null;

  // API may return unwrapped RailKit data, or still-wrapped { success, data }.
  const availData = availError
    ? null
    : Array.isArray(availEnvelope?.availability)
      ? availEnvelope
      : unwrap(info.availability);
  const fareData = fareError
    ? null
    : fareEnvelope && ('totalFare' in fareEnvelope || 'baseFare' in fareEnvelope)
      ? fareEnvelope
      : unwrap(info.fare);
  const nestedFare =
    availData?.fare && typeof availData.fare === 'object'
      ? (availData.fare as Record<string, unknown>)
      : null;

  const availList = Array.isArray(availData?.availability)
    ? (availData.availability as Record<string, unknown>[])
    : Array.isArray(availData?.avlDayList)
      ? (availData.avlDayList as Record<string, unknown>[])
      : [];

  const totalFare =
    money(fareData?.totalFare) ||
    money(nestedFare?.totalFare) ||
    money(fareData?.total) ||
    null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-[#0f294d] ring-1 ring-[#e6ebf2]">
          Class {coach}
        </span>
        {totalFare ? (
          <span className="font-bold text-[#0f294d]">Fare {totalFare}</span>
        ) : fareError ? (
          <span className="text-amber-800">{fareError}</span>
        ) : null}
      </div>

      {availError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{availError}</p>
      )}

      {!availError && availList.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {availList.slice(0, 6).map((day, index) => {
            const label = String(day.date ?? day.availablityDate ?? day.availDate ?? `Day ${index + 1}`);
            const status = String(
              day.availabilityText ?? day.availablityStatus ?? day.availabilityStatus ?? day.status ?? '—',
            );
            const prediction = day.prediction ? String(day.prediction) : '';
            return (
              <div key={`${label}-${index}`} className="rounded-xl bg-white px-3 py-2 ring-1 ring-[#e6ebf2]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-[#0f294d]">{status}</p>
                {prediction ? <p className="mt-0.5 text-xs text-slate-500">{prediction}</p> : null}
              </div>
            );
          })}
        </div>
      )}

      {!availError && availList.length === 0 && availData && (
        <pre className="max-h-56 overflow-auto rounded-xl bg-white p-3 text-xs text-slate-700 ring-1 ring-[#e6ebf2]">
          {JSON.stringify(availData, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function TrainsResultsClient({ from, to, date, coachClass }: Props) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState<TrainRow[]>([]);
  const [openTrain, setOpenTrain] = useState<string | null>(null);
  const [seatBusy, setSeatBusy] = useState(false);
  const [seatInfo, setSeatInfo] = useState<SeatPayload | null>(null);
  const [seatClass, setSeatClass] = useState(coachClass === 'ALL' ? 'SL' : coachClass);
  const [seatStations, setSeatStations] = useState<{ from: string; to: string } | null>(null);

  const queryKey = useMemo(() => `${from}|${to}|${date}`, [from, to, date]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage('');
    setRows([]);
    setOpenTrain(null);
    setSeatInfo(null);
    setSeatStations(null);

    const params = new URLSearchParams({ from, to });
    if (date) params.set('date', date);

    void fetchTrainsApi(`/api/trains/search?${params}`)
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setMessage(res.message || 'Could not load trains');
          setRows([]);
          return;
        }
        // Guard against RailKit error envelopes that look like empty lists.
        const payload = res.data;
        if (
          payload &&
          typeof payload === 'object' &&
          !Array.isArray(payload) &&
          (payload as { success?: boolean }).success === false
        ) {
          const err = (payload as { error?: unknown; message?: unknown }).error
            ?? (payload as { message?: unknown }).message;
          setMessage(String(err || res.message || 'Could not load trains'));
          setRows([]);
          return;
        }
        const list = asList(payload);
        setRows(list);
        if (!list.length) setMessage('No direct trains found for this route.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey, from, to, date]);

  async function loadSeats(row: TrainRow, coach = seatClass) {
    const train = trainNumber(row);
    if (!train || !date) {
      setSeatInfo({ error: !date ? 'Choose a travel date to check seats.' : 'Invalid train number' });
      return;
    }

    const board = stationCode(row, 'from', from).toUpperCase();
    const alight = stationCode(row, 'to', to).toUpperCase();

    setOpenTrain(train);
    setSeatStations({ from: board, to: alight });
    setSeatBusy(true);
    setSeatInfo(null);

    const params = new URLSearchParams({
      train,
      from: board,
      to: alight,
      date,
      class: coach || 'SL',
      quota: 'GN',
    });
    const res = await fetchTrainsApi(`/api/trains/availability?${params}`);
    setSeatBusy(false);
    if (!res.success) {
      setSeatInfo({ error: res.message || 'Availability unavailable' });
      return;
    }
    setSeatInfo((res.data as SeatPayload) || null);
  }

  return (
    <div className="space-y-6">
      <TrainSearchBar initialFrom={from} initialTo={to} initialDate={date} initialClass={coachClass} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Results</p>
          <h1 className="text-2xl font-extrabold text-[#0f294d]">
            {from} → {to}
          </h1>
          <p className="text-sm text-slate-500">{date ? formatIsoToDisplay(date) : 'Any day'} · {rows.length || 0} trains</p>
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

      {loading && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#e6ebf2] bg-white p-6 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-[#3264ff]" />
          Searching trains…
        </div>
      )}

      {!loading && message && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>
      )}

      <div className="space-y-3">
        {rows.map((row, index) => {
          const number = trainNumber(row) || `row-${index}`;
          const open = openTrain === number;
          return (
            <article key={`${number}-${index}`} className="overflow-hidden rounded-2xl border border-[#e6ebf2] bg-white shadow-sm">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <TrainFront className="h-5 w-5 text-[#3264ff]" />
                    <Link href={`/trains/${number}`} className="font-extrabold text-[#0f294d] hover:text-[#3264ff]">
                      {number} · {trainName(row)}
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {field(row, 'fromStnCode', 'from_stn_code', 'from')} {field(row, 'departureTime', 'from_time', 'dep')}
                    {' → '}
                    {field(row, 'toStnCode', 'to_stn_code', 'to')} {field(row, 'arrivalTime', 'to_time', 'arr')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Duration {field(row, 'duration', 'travel_time', 'travelTime')} · Runs {field(row, 'runningDays', 'running_days', 'days')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void loadSeats(row)}
                    className="rounded-xl border border-[#d7e0ee] px-3 py-2 text-sm font-semibold text-[#0f294d] hover:border-[#3264ff]"
                  >
                    Check seats
                  </button>
                  <a
                    href={IRCTC_BOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[#0f294d] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Book on IRCTC
                  </a>
                </div>
              </div>

              {open && (
                <div className="border-t border-[#eef2f7] bg-[#f8fafc] px-4 py-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Class</label>
                    <select
                      value={seatClass}
                      onChange={(event) => {
                        const next = event.target.value;
                        setSeatClass(next);
                        void loadSeats(row, next);
                      }}
                      className="rounded-lg border border-[#d7e0ee] bg-white px-2 py-1.5 text-sm"
                    >
                      {['SL', '3A', '3E', '2A', '1A', 'CC', 'EC', '2S'].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void loadSeats(row)}
                      className="rounded-lg bg-[#3264ff] px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Refresh
                    </button>
                    {seatStations && (
                      <span className="text-xs text-slate-500">
                        Checking {seatStations.from} → {seatStations.to}
                      </span>
                    )}
                  </div>
                  {seatBusy ? (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading availability…
                    </p>
                  ) : (
                    <SeatSummary info={seatInfo} coach={seatClass} />
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
