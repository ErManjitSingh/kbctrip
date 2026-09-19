'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, ExternalLink, Search } from 'lucide-react';
import { api, resolveMediaUrl, tripWebUrl } from '@/lib/api';
import { formatDate, formatInrMinor } from '@/lib/format';
import type { MarketplaceCatalog, MarketplaceProperty, OnboardingApplication } from '@/lib/types';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type Tab = 'catalog' | 'applications';

export default function HotelsInner() {
  const { push } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'applications' ? 'applications' : 'catalog';

  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catalog, setCatalog] = useState<MarketplaceProperty[]>([]);
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [props, apps] = await Promise.all([
        api.get<MarketplaceCatalog>('/public/properties?limit=24&page=1'),
        api.get<OnboardingApplication[]>('/platform/applications'),
      ]);
      setCatalog(props.properties);
      setApplications(apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supply.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((row) => `${row.name} ${row.city ?? ''} ${row.state ?? ''}`.toLowerCase().includes(q));
  }, [catalog, query]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((row) => `${row.ownerName} ${row.email}`.toLowerCase().includes(q));
  }, [applications, query]);

  const approve = async () => {
    if (!approveId) return;
    setBusy(true);
    try {
      await api.patch(`/platform/applications/${approveId}/approve`, {});
      push({ tone: 'ok', title: 'Application approved', detail: 'Tenant + owner account created.' });
      setApproveId(null);
      await load();
    } catch (err) {
      push({
        tone: 'danger',
        title: 'Approve failed',
        detail: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Hotels"
        detail="Live marketplace catalog from the booking API, plus the onboarding queue for new supply."
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button variant="secondary" onClick={() => void load()}>
              Refresh
            </Button>
            <Link href="/hotels/new" className="btn btn-primary">
              Add property
            </Link>
          </div>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs" role="tablist" aria-label="Hotels views">
        <button type="button" className={tab === 'catalog' ? 'active' : ''} onClick={() => setTab('catalog')}>
          Catalog ({catalog.length})
        </button>
        <button
          type="button"
          className={tab === 'applications' ? 'active' : ''}
          onClick={() => setTab('applications')}
        >
          Applications ({applications.length})
        </button>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'catalog' ? 'Search properties…' : 'Search applications…'}
            aria-label="Search hotels"
          />
        </label>
      </div>

      {loading ? (
        <Spinner label="Loading supply…" />
      ) : tab === 'catalog' ? (
        filteredCatalog.length === 0 ? (
          <section className="panel">
            <EmptyState
              icon={Building2}
              title="No properties found"
              detail="Seed the booking API or widen your search."
            />
          </section>
        ) : (
          <div className="hotel-grid">
            {filteredCatalog.map((property) => {
              const photo = resolveMediaUrl(property.photos[0]) ?? null;
              return (
                <article className="hotel-card" key={property.id}>
                  <div className="hotel-card-media">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" />
                    ) : (
                      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#8a8490' }}>
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="hotel-card-body">
                    <h3>{property.name}</h3>
                    <div className="muted">
                      {[property.city, property.state, property.country].filter(Boolean).join(' · ')}
                    </div>
                    <div className="hotel-card-meta">
                      <strong className="mono">{formatInrMinor(property.startingPriceMinor)}</strong>
                      <Badge tone="ok">Listed</Badge>
                    </div>
                    <div className="hotel-card-actions">
                      <a
                        className="btn btn-primary"
                        href={`${tripWebUrl()}/hotels/${property.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={13} />
                        Open on Trip
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        <section className="panel">
          {filteredApps.length === 0 ? (
            <EmptyState icon={Building2} title="No applications" detail="New hotel owners will appear here." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Rooms</th>
                  <th>PMS</th>
                  <th>Channels</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      {app.ownerName}
                      <div className="muted">{app.email}</div>
                    </td>
                    <td className="mono">{app.roomCount ?? '—'}</td>
                    <td>{app.currentPms ?? '—'}</td>
                    <td className="muted">{app.channels?.length ? app.channels.join(', ') : '—'}</td>
                    <td>
                      <Badge tone={statusTone(app.status)}>{app.status}</Badge>
                    </td>
                    <td className="muted mono">{formatDate(app.createdAt)}</td>
                    <td>
                      {(app.status === 'pending' || app.status === 'submitted') && (
                        <Button variant="primary" onClick={() => setApproveId(app.id)}>
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <Modal
        open={Boolean(approveId)}
        title="Approve application?"
        onClose={() => setApproveId(null)}
        footer={
          <>
            <Button onClick={() => setApproveId(null)}>Cancel</Button>
            <Button variant="primary" disabled={busy} onClick={() => void approve()}>
              {busy ? 'Approving…' : 'Approve & create tenant'}
            </Button>
          </>
        }
      >
        <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
          This creates a tenant workspace and owner login from the application password — same flow as booking
          super-admin.
        </p>
      </Modal>
    </>
  );
}
