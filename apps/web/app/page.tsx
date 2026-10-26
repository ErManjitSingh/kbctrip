import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck } from 'lucide-react';
import { TravelSearch } from '@/components/TravelSearch';
import { DestinationShowcase } from '@/components/DestinationShowcase';
import { OfferShowcase } from '@/components/OfferShowcase';
import { SiteFooter } from '@/components/SiteFooter';
import {
  HomeCabsSection,
  HomeFinalCtaSection,
} from '@/components/home/home-story-sections';
import { HomePackagesSection, HomeStaysSection } from '@/components/home/home-catalog-sections';
import { HomeBoardSlider } from '@/components/home/HomeBoardSlider';
import { MobileTripHome } from '@/components/home/MobileTripHome';
import './kbc-home.css';
import './home-redesign.css';

/**
 * Homepage — hero · search · destinations · packages · stays · offers · cabs · CTA
 */
export default function HomePage() {
  return (
    <div className="kbc-shell kbc-home-v2">
      <div className="kbc-atmosphere" aria-hidden="true" />
      <main>
        <MobileTripHome />
        <link rel="preload" as="image" href="/images/home/lite/hero-desktop.jpg" />
        <section className="page-width trip-banner home-hero-only">
          <Image
            className="trip-banner-photo trip-banner-photo-desk"
            src="/images/home/lite/hero-desktop.jpg"
            alt=""
            fill
            sizes="(max-width: 1368px) 100vw, 1320px"
          />
          <Image
            className="trip-banner-photo trip-banner-photo-phone"
            src="/images/home/lite/hero-mobile.jpg"
            alt=""
            fill
            sizes="100vw"
          />
          <p className="trip-kicker">Explore the world</p>
          <h1>
            <span className="trip-h1-desk">Book everything. Travel everywhere.</span>
            <span className="trip-h1-phone">Your Next<br />Journey <em>Awaits</em></span>
          </h1>
          <p className="trip-lead">Book hotels, holiday packages, cabs, activities and flights — all in one place.</p>
          <ul className="trip-promises">
            <li><BadgeCheck size={15} aria-hidden /> Verified stays</li>
            <li><ShieldCheck size={15} aria-hidden /> Secure payments</li>
            <li><Headphones size={15} aria-hidden /> 24/7 support</li>
          </ul>
        </section>

        <div className="home-search-wrap home-reveal-late">
          <TravelSearch scope="banner" />
        </div>

        <HomeBoardSlider className="home-board-desktop" />

        <Link href="/packages?q=Goa" className="home-phone-spot" aria-label="Goa Packages, flat 35% off">
          <Image src="/images/home/lite/dest-goa.jpg" alt="" fill sizes="100vw" />
          <span className="home-phone-spot-shade" aria-hidden="true" />
          <span className="home-phone-spot-copy">
            <small>Flat 35% off</small>
            <strong>Goa Packages</strong>
            <span>Premium stays and weekend trips.</span>
          </span>
          <span className="home-phone-spot-go" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        </Link>

        <DestinationShowcase />
        <HomePackagesSection />
        <HomeStaysSection />
        <OfferShowcase />
        <HomeCabsSection />
        <HomeFinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
