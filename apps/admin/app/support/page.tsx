'use client';

import { useMemo, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageHeader } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { loadTickets, saveTickets } from '@/lib/ops-data';
import type { SupportTicket } from '@/lib/types';

export default function SupportPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<SupportTicket[]>(() => loadTickets());
  const [filter, setFilter] = useState<'all' | SupportTicket['status'] | 'urgent'>('all');

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (filter === 'all') return true;
      if (filter === 'urgent') return row.priority === 'urgent' && row.status !== 'resolved';
      return row.status === filter;
    });
  }, [rows, filter]);

  const setStatus = (id: string, status: SupportTicket['status']) => {
    const next = rows.map((row) =>
      row.id === id ? { ...row, status, updatedAt: new Date().toISOString() } : row,
    );
    setRows(next);
    saveTickets(next);
    push({ tone: 'ok', title: `Marked ${status}`, detail: 'Demo support queue.' });
  };

  return (
    <>
      <PageHeader
        title="Support"
        detail="Lightweight ticket queue tied to booking refs. Demo until a real helpdesk exists."
      />

      <div className="toolbar">
        {(['all', 'open', 'pending', 'resolved', 'urgent'] as const).map((item) => (
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
          <EmptyState icon={LifeBuoy} title="Queue clear" detail="No tickets in this filter." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Guest</th>
                <th>Booking</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong style={{ fontWeight: 650 }}>{row.subject}</strong>
                  </td>
                  <td>{row.guest}</td>
                  <td className="mono">{row.bookingRef ?? '—'}</td>
                  <td>
                    <Badge tone={statusTone(row.priority)}>{row.priority}</Badge>
                  </td>
                  <td>
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="muted mono">{formatDateTime(row.updatedAt)}</td>
                  <td>
                    <div className="page-actions">
                      {row.status !== 'pending' ? (
                        <Button onClick={() => setStatus(row.id, 'pending')}>Pending</Button>
                      ) : null}
                      {row.status !== 'resolved' ? (
                        <Button variant="primary" onClick={() => setStatus(row.id, 'resolved')}>
                          Resolve
                        </Button>
                      ) : (
                        <Button onClick={() => setStatus(row.id, 'open')}>Reopen</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
