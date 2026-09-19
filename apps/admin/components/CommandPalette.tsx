'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CalendarRange,
  Car,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Package,
  Search,
  Users,
} from 'lucide-react';

const links = [
  { label: 'Dashboard', href: '/', hint: 'Overview', icon: LayoutDashboard },
  { label: 'Bookings', href: '/bookings', hint: 'Marketplace trips', icon: CalendarRange },
  { label: 'Hotels', href: '/hotels', hint: 'Supply & applications', icon: Building2 },
  { label: 'Add property', href: '/hotels/new', hint: 'Hotel wizard', icon: Building2 },
  { label: 'Packages', href: '/packages', hint: 'Holiday packages', icon: Package },
  { label: 'Cabs', href: '/cabs', hint: 'Fleet manager', icon: Car },
  { label: 'Guests', href: '/guests', hint: 'Traveller accounts', icon: Users },
  { label: 'Content', href: '/content', hint: 'Homepage CMS', icon: Megaphone },
  { label: 'Support', href: '/support', hint: 'Open tickets', icon: LifeBuoy },
] as const;

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...links];
    return links.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[active]) {
        e.preventDefault();
        router.push(results[active].href);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, results, active, router]);

  if (!open) return null;

  return (
    <div className="cmd-root" role="presentation" onClick={onClose}>
      <div className="cmd-card" role="dialog" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input">
          <Search size={16} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a module…"
            aria-label="Search commands"
          />
        </div>
        <div className="cmd-list">
          {results.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <h3>No matches</h3>
              <p>Try bookings, hotels, or content.</p>
            </div>
          ) : (
            results.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  className={`cmd-item${index === active ? ' active' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                  <span>{item.hint}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
