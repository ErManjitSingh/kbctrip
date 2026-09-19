'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Package, Plus, Search, Trash2 } from 'lucide-react';
import { api, tripWebUrl } from '@/lib/api';
import { formatInrMinor } from '@/lib/format';
import type { MarketplacePackage } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function PackagesPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<MarketplacePackage[]>([]);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<MarketplacePackage[]>('/platform/marketplace-packages');
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.title} ${row.destination} ${row.category ?? ''} ${row.slug}`.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const togglePublish = async (pack: MarketplacePackage) => {
    try {
      await api.patch(`/platform/marketplace-packages/${pack.id}`, { published: !pack.published });
      push({
        tone: 'ok',
        title: pack.published ? 'Unpublished' : 'Published on website',
        detail: pack.title,
      });
      await load();
    } catch (err) {
      push({
        tone: 'danger',
        title: 'Update failed',
        detail: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      await api.del(`/platform/marketplace-packages/${deleteId}`);
      push({ tone: 'ok', title: 'Package deleted' });
      setDeleteId(null);
      await load();
    } catch (err) {
      push({
        tone: 'danger',
        title: 'Delete failed',
        detail: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Packages"
        detail="Package maker + itinerary maker. Publish to show on the guest website."
        actions={
          <>
            <Button variant="secondary" onClick={() => void load()}>
              Refresh
            </Button>
            <Link href="/packages/new">
              <Button variant="primary">
                <Plus size={15} /> Package maker
              </Button>
            </Link>
          </>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="toolbar">
        <label className="search-field">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, destination, category…"
          />
        </label>
        <a className="text-link" href={`${tripWebUrl()}/packages`} target="_blank" rel="noreferrer">
          View on website <ExternalLink size={13} />
        </a>
      </div>

      {loading ? (
        <Spinner label="Loading packages…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No packages yet"
          detail="Open the package maker to build a listing and day-by-day itinerary."
          action={
            <Link href="/packages/new">
              <Button variant="primary">Open package maker</Button>
            </Link>
          }
        />
      ) : (
        <section className="panel">
          <div className="panel-body table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Duration</th>
                  <th>Itinerary</th>
                  <th>From</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((pack) => {
                  const days = Array.isArray(pack.itinerary) ? pack.itinerary.length : 0;
                  return (
                    <tr key={pack.id}>
                      <td>
                        <strong>{pack.title}</strong>
                        <div className="muted">
                          {pack.destination}
                          {pack.category ? ` · ${pack.category}` : ''}
                        </div>
                      </td>
                      <td>
                        {pack.days}D / {pack.nights}N
                      </td>
                      <td>{days ? `${days} days` : 'Not set'}</td>
                      <td>{formatInrMinor(pack.pricePerPersonMinor)} / person</td>
                      <td>
                        <Badge tone={pack.published ? 'ok' : 'warn'}>
                          {pack.published ? 'Live' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="row-actions">
                        <Link href={`/packages/${pack.id}`}>
                          <Button>Edit / itinerary</Button>
                        </Link>
                        <Button onClick={() => void togglePublish(pack)}>
                          {pack.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <a
                          className="ghost-link"
                          href={`${tripWebUrl()}/packages/${pack.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                        <button
                          type="button"
                          className="icon-danger"
                          aria-label="Delete"
                          onClick={() => setDeleteId(pack.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal
        open={Boolean(deleteId)}
        title="Delete package?"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" disabled={busy} onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </>
        }
      >
        <p className="muted" style={{ margin: 0 }}>
          This removes the package from admin and the guest website. This cannot be undone.
        </p>
      </Modal>
    </>
  );
}
