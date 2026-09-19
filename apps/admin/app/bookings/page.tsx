'use client';

import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { BookingDrawer } from '@/components/BookingDrawer';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageHeader } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatInr } from '@/lib/format';
import { loadBookings, saveBookings } from '@/lib/ops-data';
import type { BookingRow, BookingStatus } from '@/lib/types';

const filters: Array<'all' | BookingStatus> = ['all', 'confirmed', 'held', 'cancelled', 'refunded', 'completed'];

export default function BookingsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<BookingRow[]>(() => loadBookings());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false;
      if (!q) return true;
      return [row.ref, row.guest, row.email, row.hotel, row.city].join(' ').toLowerCase().includes(q);
    });
  }, [rows, query, filter]);

  const persist = (next: BookingRow[]) => {
    setRows(next);
    saveBookings(next);
  };

  const exportCsv = () => {
    const header = ['ref', 'guest', 'email', 'hotel', 'city', 'checkIn', 'checkOut', 'amount', 'status'];
    const lines = [
      header.join(','),
      ...visible.map((row) =>
        [row.ref, row.guest, row.email, row.hotel, row.city, row.checkIn, row.checkOut, row.amount, row.status]
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kbc-trip-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push({ tone: 'ok', title: 'CSV exported', detail: `${visible.length} rows` });
  };

  const confirmCancel = () => {
    if (!cancelId) return;
    const next = rows.map((row) =>
      row.id === cancelId
        ? {
            ...row,
            status: 'cancelled' as const,
            payment: 'refunded' as const,
            timeline: [
              ...row.timeline,
              { at: new Date().toISOString(), label: 'Cancelled', detail: 'Ops console · demo' },
            ],
          }
        : row,
    );
    persist(next);
    setSelected((prev) => next.find((row) => row.id === prev?.id) ?? null);
    setCancelId(null);
    push({ tone: 'warn', title: 'Booking cancelled', detail: 'Demo ledger only — wire platform cancel next.' });
  };

  const confirmHold = (id: string) => {
    const next = rows.map((row) =>
      row.id === id
        ? {
            ...row,
            status: 'confirmed' as const,
            payment: 'razorpay' as const,
            timeline: [
              ...row.timeline,
              { at: new Date().toISOString(), label: 'Confirmed', detail: 'Marked paid by ops · demo' },
            ],
          }
        : row,
    );
    persist(next);
    setSelected((prev) => next.find((row) => row.id === prev?.id) ?? null);
    push({ tone: 'ok', title: 'Hold confirmed', detail: 'Guest would receive ticket in production.' });
  };

  return (
    <>
      <PageHeader
        title="Bookings"
        detail="Cross-marketplace folio view. Actions persist locally until GET/PATCH /platform/bookings exists."
        actions={
          <Button variant="secondary" icon={<Download size={14} />} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <div className="notice-banner">
        Demo ledger — shaped like the future platform bookings API. Cancel / confirm are local only.
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ref, guest, hotel…"
            aria-label="Search bookings"
          />
        </label>
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-chip${filter === item ? ' active' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="panel">
        {visible.length === 0 ? (
          <EmptyState icon={Search} title="No bookings match" detail="Clear filters or try another search." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={row.id}
                  className="clickable"
                  onClick={() => setSelected(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelected(row);
                  }}
                  tabIndex={0}
                >
                  <td className="mono">{row.ref}</td>
                  <td>
                    {row.guest}
                    <div className="muted">{row.email}</div>
                  </td>
                  <td>
                    {row.hotel}
                    <div className="muted">{row.city}</div>
                  </td>
                  <td className="mono">
                    {formatDate(row.checkIn)}
                    <div className="muted">→ {formatDate(row.checkOut)}</div>
                  </td>
                  <td className="mono">{formatInr(row.amount)}</td>
                  <td>
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="muted mono">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <BookingDrawer
        booking={selected}
        onClose={() => setSelected(null)}
        onCancel={(id) => setCancelId(id)}
        onConfirmHold={confirmHold}
      />

      <Modal
        open={Boolean(cancelId)}
        title="Cancel this booking?"
        onClose={() => setCancelId(null)}
        footer={
          <>
            <Button onClick={() => setCancelId(null)}>Keep booking</Button>
            <Button variant="danger" onClick={confirmCancel}>
              Cancel & refund
            </Button>
          </>
        }
      >
        <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
          This updates the demo ledger only. In production this will call the platform cancel endpoint and notify the
          guest.
        </p>
      </Modal>
    </>
  );
}
