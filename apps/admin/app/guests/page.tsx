'use client';

import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState, PageHeader } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatInr, initials } from '@/lib/format';
import { loadGuests, saveGuests } from '@/lib/ops-data';
import type { GuestRow } from '@/lib/types';

export default function GuestsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<GuestRow[]>(() => loadGuests());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | GuestRow['status']>('all');
  const [selected, setSelected] = useState<GuestRow | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false;
      if (!q) return true;
      return [row.name, row.email, row.phone, row.city].join(' ').toLowerCase().includes(q);
    });
  }, [rows, query, filter]);

  const persist = (next: GuestRow[]) => {
    setRows(next);
    saveGuests(next);
  };

  const toggleBlock = (id: string) => {
    const next = rows.map((row) =>
      row.id === id
        ? {
            ...row,
            status: row.status === 'blocked' ? ('active' as const) : ('blocked' as const),
            tags:
              row.status === 'blocked'
                ? row.tags.filter((tag) => tag !== 'abuse')
                : Array.from(new Set([...row.tags, 'abuse'])),
          }
        : row,
    );
    persist(next);
    const updated = next.find((row) => row.id === id) ?? null;
    setSelected(updated);
    push({
      tone: updated?.status === 'blocked' ? 'danger' : 'ok',
      title: updated?.status === 'blocked' ? 'Guest blocked' : 'Guest unblocked',
      detail: 'Demo directory — platform guest API coming next.',
    });
  };

  return (
    <>
      <PageHeader
        title="Guests"
        detail="Traveller directory with block controls. Persists locally until admin guest APIs ship."
      />

      <div className="notice-banner">Demo guest ledger. VIP / block state is local to this browser.</div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone…"
            aria-label="Search guests"
          />
        </label>
        {(['all', 'active', 'vip', 'blocked'] as const).map((item) => (
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
          <EmptyState icon={Users} title="No guests match" detail="Try another filter." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Phone</th>
                <th>City</th>
                <th>Trips</th>
                <th>Spend</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="clickable" onClick={() => setSelected(row)}>
                  <td>
                    <div className="row-with-avatar">
                      <span className="guest-avatar">{initials(row.name)}</span>
                      <span>
                        {row.name}
                        <div className="muted">{row.email}</div>
                      </span>
                    </div>
                  </td>
                  <td className="mono">{row.phone}</td>
                  <td>{row.city}</td>
                  <td className="mono">{row.trips}</td>
                  <td className="mono">{formatInr(row.spend)}</td>
                  <td>
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant={row.status === 'blocked' ? 'secondary' : 'danger'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBlock(row.id);
                      }}
                    >
                      {row.status === 'blocked' ? 'Unblock' : 'Block'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Drawer
        open={Boolean(selected)}
        title={selected?.name ?? 'Guest'}
        subtitle={selected?.email}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
              {selected.tags.map((tag) => (
                <Badge key={tag} tone="muted">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span>Phone</span>
                <strong>{selected.phone}</strong>
              </div>
              <div className="detail-item">
                <span>City</span>
                <strong>{selected.city}</strong>
              </div>
              <div className="detail-item">
                <span>Trips</span>
                <strong>{selected.trips}</strong>
              </div>
              <div className="detail-item">
                <span>Lifetime spend</span>
                <strong>{formatInr(selected.spend)}</strong>
              </div>
              <div className="detail-item">
                <span>Joined</span>
                <strong>{formatDate(selected.joinedAt)}</strong>
              </div>
              <div className="detail-item">
                <span>Last trip</span>
                <strong>{selected.lastTripAt ? formatDate(selected.lastTripAt) : '—'}</strong>
              </div>
            </div>
            <Button
              variant={selected.status === 'blocked' ? 'primary' : 'danger'}
              onClick={() => toggleBlock(selected.id)}
            >
              {selected.status === 'blocked' ? 'Unblock guest' : 'Block guest'}
            </Button>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
