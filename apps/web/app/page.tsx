import Image from 'next/image';
import { BadgeCheck, Headphones, ShieldCheck } from 'lucide-react';
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
import { MobileHome } from '@/components/home/MobileHome';
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
        <MobileHome />
        <div className="home-desktop">
        <section className="page-width trip-banner home-hero-only">
          <Image
            className="trip-banner-photo"
            src="/images/holiday-packages-hero.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1368px) 100vw, 1320px"
          />
          <h1>Book everything. Travel everywhere.</h1>
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

        <DestinationShowcase />
        <HomePackagesSection />
        <HomeStaysSection />
        <OfferShowcase />
        <HomeCabsSection />
        <HomeFinalCtaSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
