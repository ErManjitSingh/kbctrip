import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TravelSearch } from '@/components/TravelSearch';
import { DestinationShowcase } from '@/components/DestinationShowcase';
import { OfferShowcase } from '@/components/OfferShowcase';
import { SiteFooter } from '@/components/SiteFooter';
import {
  HomeCabsSection,
  HomeFinalCtaSection,
} from '@/components/home/home-story-sections';
import { HomePackagesSection, HomeStaysSection } from '@/components/home/home-catalog-sections';
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
        <section className="page-width hero">
          <div className="hero-copy home-reveal">
            <h1>
              Book <em>everything.</em>
              <br />
              Travel <em>everywhere.</em>
            </h1>
            <p className="hero-lead">
              Private stays, considered itineraries, one account. India first, then the rest of the map.
            </p>
            <div className="hero-proof">
              <Image
                className="trusted-hero"
                src="/reference/trusted-hero.png"
                alt="Trusted by 1.2 million happy travellers"
                width={220}
                height={48}
              />
            </div>
            <div className="hero-cta-row">
              <Link href="/hotels" className="hero-cta-primary">
                Browse stays
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/packages" className="hero-cta-secondary">
                View packages
              </Link>
            </div>
          </div>
          <div className="hero-art home-reveal-delay" aria-hidden="true">
            <div className="hero-art-glow" />
            <Image
              src="/reference/hero-visual-hd.png"
              alt=""
              fill
              priority
              unoptimized
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
        </section>

        <div className="home-search-wrap home-reveal-late">
          <TravelSearch />
        </div>

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
