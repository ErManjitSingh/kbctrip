'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { initials } from '@/lib/format';
import { loadTickets } from '@/lib/ops-data';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/bookings': 'Bookings',
  '/hotels/new': 'Add property',
  '/hotels': 'Hotels',
  '/packages': 'Packages',
  '/cabs': 'Cabs',
  '/guests': 'Guests',
  '/content': 'Content',
  '/support': 'Support',
};

export function AuthShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') router.replace('/login');
    if (!loading && user && pathname === '/login') router.replace('/');
  }, [loading, user, pathname, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (user) setTicketCount(loadTickets().filter((t) => t.status !== 'resolved').length);
  }, [user, pathname]);

  const title = useMemo(() => {
    const match = Object.keys(titles)
      .sort((a, b) => b.length - a.length)
      .find((key) => (key === '/' ? pathname === '/' : pathname.startsWith(key)));
    return titles[match ?? '/'] ?? 'Platform ops';
  }, [pathname]);

  if (pathname === '/login') return <>{children}</>;

  if (loading) {
    return <div className="ops-loading">Loading console…</div>;
  }

  if (!user) {
    return <div className="ops-loading">Redirecting to sign in…</div>;
  }

  return (
    <div className="ops-shell">
      <Sidebar openTickets={ticketCount} />
      <div className="ops-main">
        <header className="ops-topbar">
          <div>
            <h1>{title}</h1>
            <div className="ops-topbar-meta">KBC Trip marketplace</div>
          </div>
          <div className="ops-topbar-right">
            <button type="button" className="cmd-trigger" onClick={() => setCmdOpen(true)}>
              <Search size={14} />
              Search ops…
              <kbd>⌘K</kbd>
            </button>
            <div className="ops-user">
              <div className="ops-user-copy">
                <strong>{user.name}</strong>
                <span>{user.role.replace('_', ' ')}</span>
              </div>
              <div className="ops-avatar" aria-hidden="true">
                {initials(user.name)}
              </div>
              <button type="button" className="ops-logout" aria-label="Sign out" onClick={logout}>
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>
        <main className="ops-content">{children}</main>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
