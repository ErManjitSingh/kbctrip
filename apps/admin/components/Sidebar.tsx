'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  CalendarRange,
  Car,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Package,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from './AuthProvider';

type NavItem = { label: string; href: string; icon: LucideIcon; count?: number };

const primary: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Bookings', href: '/bookings', icon: CalendarRange },
  { label: 'Hotels', href: '/hotels', icon: Building2 },
  { label: 'Packages', href: '/packages', icon: Package },
  { label: 'Cabs', href: '/cabs', icon: Car },
  { label: 'Guests', href: '/guests', icon: Users },
];

const secondary: NavItem[] = [
  { label: 'Content', href: '/content', icon: Megaphone },
  { label: 'Support', href: '/support', icon: LifeBuoy },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link href={item.href} className={active ? 'active' : undefined}>
      <Icon size={16} />
      {item.label}
      {typeof item.count === 'number' ? <span className="nav-count">{item.count}</span> : null}
    </Link>
  );
}

export function Sidebar({ openTickets = 0 }: { openTickets?: number }) {
  const pathname = usePathname();
  const { apiOnline } = useAuth();

  return (
    <aside className="ops-sidebar">
      <div className="ops-sidebar-brand">
        <BrandLogo href="/" tone="light" size="sm" />
        <small>Marketplace ops</small>
      </div>

      <nav className="ops-nav" aria-label="Platform navigation">
        <div className="ops-nav-label">Operate</div>
        {primary.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
        <div className="ops-nav-label">Grow</div>
        {secondary.map((item) => (
          <NavLink
            key={item.href}
            item={item.href === '/support' ? { ...item, count: openTickets || undefined } : item}
            pathname={pathname}
          />
        ))}
      </nav>

      <div className="ops-sidebar-foot">
        <strong>{apiOnline === false ? 'API offline' : apiOnline ? 'Connected to booking API' : 'Checking API…'}</strong>
        Hotels & packages live · cabs local store until cab API ships
      </div>
    </aside>
  );
}
