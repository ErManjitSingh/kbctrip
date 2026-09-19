import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { GuestAuthNav } from './GuestAuthNav';

export function CatalogHeader({ active = 'Hotels' }: { active?: 'Home' | 'Hotels' | 'Flights' | 'Packages' | 'Account' }) {
  return (
    <header className="catalog-topbar discover-topbar">
      <div className="page-width catalog-topbar-inner">
        <BrandLogo className="catalog-brand" />
        <nav aria-label="Catalog navigation">
          <Link href="/">Home</Link>
          <Link className={active === 'Hotels' ? 'active' : undefined} href="/hotels" aria-current={active === 'Hotels' ? 'page' : undefined}>
            Stays
          </Link>
          <Link className={active === 'Flights' ? 'active' : undefined} href="/flights">Flights</Link>
          <Link className={active === 'Packages' ? 'active' : undefined} href="/packages">Packages</Link>
        </nav>
        <GuestAuthNav />
      </div>
    </header>
  );
}
