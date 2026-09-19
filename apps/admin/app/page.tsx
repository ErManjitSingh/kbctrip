'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatInr, relativeTime } from '@/lib/format';
import { dashboardMockStats, loadBookings, loadTickets } from '@/lib/ops-data';
import type { OnboardingApplication, TenantSummary } from '@/lib/types';
import { Badge, statusTone } from '@/components/ui/Badge';
import { PageHeader, Spinner, StatCard } from '@/components/ui/Primitives';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
  const { apiOnline } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [mock] = useState(() => dashboardMockStats());
  const bookings = loadBookings().slice(0, 5);
  const tickets = loadTickets().filter((t) => t.status !== 'resolved').slice(0, 4);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [tenantRows, appRows] = await Promise.all([
          api.get<TenantSummary[]>('/platform/tenants'),
          api.get<OnboardingApplication[]>('/platform/applications'),
        ]);
        if (!cancelled) {
          setTenants(tenantRows);
          setApplications(appRows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load platform stats.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingApps = applications.filter((a) => a.status === 'pending' || a.status === 'submitted').length;
  const propertyCount = tenants.reduce((sum, t) => sum + t.propertyCount, 0);

  return (
    <>
      <PageHeader
        title="Overview"
        detail="Marketplace pulse — live platform supply on the left, demo booking economics until the cross-tenant API lands."
        actions={
          <Link className="btn btn-primary" href="/hotels">
            Review supply
          </Link>
        }
      />

      {apiOnline === false ? (
        <div className="error-banner">Booking API offline. Live tiles need Nest on :4000.</div>
      ) : null}
      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stat-grid">
        <StatCard label="Bookings today" value={String(mock.today)} delta="Demo ledger" up />
        <StatCard label="Confirmed GMV" value={formatInr(mock.gmv)} delta="Demo ledger" up />
        <StatCard
          label="Tenants"
          value={loading ? '…' : String(tenants.length)}
          delta={`${propertyCount} properties`}
          live
          up
        />
        <StatCard
          label="Pending apps"
          value={loading ? '…' : String(pendingApps)}
          delta={`${mock.tickets} open support`}
          live={pendingApps >= 0}
          up={pendingApps === 0}
        />
      </div>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Latest bookings</h3>
            <Link className="muted" href="/bookings">
              View all
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Guest</th>
                <th>Stay</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((row) => (
                <tr key={row.id}>
                  <td className="mono">{row.ref}</td>
                  <td>
                    {row.guest}
                    <div className="muted">{row.email}</div>
                  </td>
                  <td>
                    {row.hotel}
                    <div className="muted">{row.city}</div>
                  </td>
                  <td className="mono">{formatInr(row.amount)}</td>
                  <td>
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div style={{ display: 'grid', gap: 14 }}>
          <section className="panel">
            <div className="panel-head">
              <h3>Onboarding queue</h3>
              <Link className="muted" href="/hotels?tab=applications">
                Open
              </Link>
            </div>
            <div className="panel-body">
              {loading ? (
                <Spinner label="Loading applications…" />
              ) : applications.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  No applications yet.
                </p>
              ) : (
                <div className="list-feed">
                  {applications.slice(0, 4).map((app) => (
                    <div className="list-feed-item" key={app.id}>
                      <div>
                        <strong>{app.ownerName}</strong>
                        <span>
                          {app.email} · {app.roomCount ?? '—'} rooms
                        </span>
                      </div>
                      <Badge tone={statusTone(app.status)}>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3>Support</h3>
              <Link className="muted" href="/support">
                Queue
              </Link>
            </div>
            <div className="panel-body list-feed">
              {tickets.map((ticket) => (
                <div className="list-feed-item" key={ticket.id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <span>
                      {ticket.guest}
                      {ticket.bookingRef ? ` · ${ticket.bookingRef}` : ''}
                    </span>
                  </div>
                  <span className="muted">{relativeTime(ticket.updatedAt)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
