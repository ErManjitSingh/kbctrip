import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const services = [
  { name: 'Hotels', description: 'Stay in comfort', price: 'From ₹999', href: '/hotels', image: '/reference/service-cards/hotels.png' },
  { name: 'Flights', description: 'Fly to your dream', price: 'From ₹1,499', href: '/flights', image: '/reference/service-cards/flights.png' },
  { name: 'Trains', description: 'Travel in comfort', price: 'From ₹499', href: '/trains', image: '/reference/service-cards/trains.png' },
  { name: 'Buses', description: 'Safe & reliable', price: 'From ₹399', href: '/buses', image: '/reference/service-cards/buses.png' },
  { name: 'Cabs', description: 'Ride anywhere', price: 'From ₹199', href: '/cabs', image: '/reference/service-cards/cabs.png' },
  { name: 'Packages', description: 'Curated for you', price: 'Explore now', href: '/packages', image: '/reference/service-cards/packages.png' },
] as const;

export function ServiceCards() {
  return (
    <section className="page-width services-section" aria-labelledby="services-title">
      <h2 id="services-title">The house, in full</h2>
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
