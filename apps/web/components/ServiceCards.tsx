import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    name: 'Hotels',
    detail: 'Verified stays',
    href: '/hotels',
    image: '/reference/service-cards/hotels.png',
    className: 'service-book-hotels',
  },
  {
    name: 'Packages',
    detail: 'Planned itineraries',
    href: '/packages',
    image: '/images/brochure-shimla-church.png',
    className: 'service-book-packages',
  },
  {
    name: 'Cabs',
    detail: 'Airport & outstation',
    href: '/cabs',
    image: '/images/cabs/uno-cabs-traveller-pickup-v2.png',
    className: 'service-book-cabs',
  },
] as const;

export function ServiceCards() {
  return (
    <section
      className="page-width reference-section services-section"
      aria-labelledby="services-title"
    >
      <div className="section-heading">
        <div className="section-heading-copy">
          <p className="section-kicker">Book</p>
          <h2 id="services-title">Hotels, packages &amp; cabs</h2>
        </div>
      </div>

      <div className="service-book-grid">
        {products.map((product) => (
          <Link
            key={product.href}
            href={product.href}
            className={`service-book-card ${product.className}`}
            aria-label={product.name}
          >
            <Image
              className="service-book-image"
              src={product.image}
              alt=""
              fill
              sizes="(max-width: 700px) 100vw, 33vw"
              unoptimized
            />
            <span className="service-book-shade" aria-hidden />
            <span className="service-book-copy">
              <strong>{product.name}</strong>
              <span>{product.detail}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
