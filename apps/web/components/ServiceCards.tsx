import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/** MVP surface: Hotels + Packages only (cabs/flights deferred). */
const services = [
  { name: 'Hotels', description: 'Stay in comfort', price: 'From ₹999', href: '/hotels', image: '/reference/service-cards/hotels.png' },
  { name: 'Packages', description: 'Curated for you', price: 'Explore now', href: '/packages', image: '/reference/service-cards/packages.png' },
] as const;

export function ServiceCards() {
  return (
    <section className="page-width services-section" aria-labelledby="services-title">
      <h2 id="services-title">Plan your trip</h2>
      <div className="service-card-grid">
        {services.map((service) => (
          <Link href={service.href} key={service.name} className="service-card" aria-label={`Browse ${service.name}`}>
            <span className="service-card-copy">
              <strong>{service.name}</strong>
              <span>{service.description}</span>
              <b>{service.price}</b>
            </span>
            <span className="service-card-image-wrap"><Image src={service.image} alt="" fill sizes="(max-width: 600px) 44vw, 16vw" unoptimized /></span>
            <span className="service-card-arrow"><ArrowUpRight size={13} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
