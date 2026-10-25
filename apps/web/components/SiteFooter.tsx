import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import './site-footer.css';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width site-footer-top">
        <div className="footer-brand-block">
          <BrandLogo tone="light" size="lg" />
          <p>Verified stays across India. Hotels, packages, and cabs in one account.</p>
          <a className="footer-mail" href="mailto:hello@kbctrip.com">hello@kbctrip.com</a>
        </div>

        <div className="footer-nav-grid">
          <nav className="footer-column" aria-label="Travel services">
            <h2>Travel</h2>
            <Link href="/hotels">Stays</Link>
            <Link href="/flights">Flights</Link>
            <Link href="/trains">Trains</Link>
            <Link href="/buses">Buses</Link>
            <Link href="/packages">Packages</Link>
          </nav>
          <nav className="footer-column" aria-label="Company information">
            <h2>Company</h2>
            <Link href="/about">About</Link>
            <Link href="/offers">Offers</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav className="footer-column" aria-label="Customer support">
            <h2>Support</h2>
            <Link href="/help">Help centre</Link>
            <Link href="/account/bookings">Manage booking</Link>
            <Link href="/cancellation">Cancellations</Link>
            <Link href="/safety">Safety</Link>
          </nav>
          <nav className="footer-column" aria-label="Account">
            <h2>Account</h2>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Join KBC Trip</Link>
            <Link href="/account">My account</Link>
            <Link href="/account/bookings">My trips</Link>
          </nav>
        </div>
      </div>

      <div className="page-width footer-bottom">
        <span>© {new Date().getFullYear()} KBC Trip</span>
        <div className="footer-bottom-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
        <span className="footer-locale">India · INR</span>
      </div>
    </footer>
  );
}
