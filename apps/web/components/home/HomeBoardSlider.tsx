'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  src: string;
  alt: string;
  href: string;
  width: number;
  height: number;
};

const INTERNATIONAL: Slide[] = [
  { src: '/images/home/slides/intl-dubai.jpg', alt: 'Dubai', href: '/packages?q=Dubai', width: 1600, height: 378 },
  { src: '/images/home/slides/intl-thailand.jpg', alt: 'Thailand', href: '/packages?q=Thailand', width: 1600, height: 379 },
  { src: '/images/home/slides/intl-singapore.jpg', alt: 'Singapore', href: '/packages?q=Singapore', width: 1600, height: 366 },
  { src: '/images/home/slides/intl-malaysia.jpg', alt: 'Malaysia', href: '/packages?q=Malaysia', width: 1600, height: 368 },
  { src: '/images/home/slides/intl-bali.jpg', alt: 'Bali', href: '/packages?q=Bali', width: 1600, height: 356 },
  { src: '/images/home/slides/intl-vietnam.jpg', alt: 'Vietnam', href: '/packages?q=Vietnam', width: 1600, height: 363 },
];

const DOMESTIC: Slide[] = [
  { src: '/images/home/slides/dom-himachal.jpg', alt: 'Himachal', href: '/packages?q=Himachal', width: 1286, height: 380 },
  { src: '/images/home/slides/dom-kashmir.jpg', alt: 'Kashmir', href: '/hotels?city=Kashmir', width: 1290, height: 380 },
  { src: '/images/home/slides/dom-rajasthan.jpg', alt: 'Rajasthan', href: '/packages?q=Rajasthan', width: 1282, height: 380 },
  { src: '/images/home/slides/dom-uttarakhand.jpg', alt: 'Uttarakhand', href: '/hotels?city=Uttarakhand', width: 1286, height: 390 },
  { src: '/images/home/slides/dom-goa.jpg', alt: 'Goa', href: '/hotels?city=Goa', width: 1290, height: 390 },
  { src: '/images/home/slides/dom-kerala.jpg', alt: 'Kerala', href: '/hotels?city=Kerala', width: 1282, height: 390 },
];

function PromoSlider({
  slides,
  label,
  interval,
  className,
  start = 0,
}: {
  slides: Slide[];
  label: string;
  interval: number;
  className: string;
  start?: number;
}) {
  const [index, setIndex] = useState(start);
  const [paused, setPaused] = useState(false);
  const drag = useRef(0);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [paused, interval, slides.length]);

  const go = (next: number) => {
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <div
      className={`home-promo ${className}`}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="home-promo-viewport">
        <div
          className="home-promo-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
          onPointerDown={(event) => {
            const startX = event.clientX;
            const target = event.currentTarget;
            const finish = (end: PointerEvent) => {
              target.removeEventListener('pointerup', finish);
              drag.current = end.clientX - startX;
              if (drag.current > 48) go(index - 1);
              if (drag.current < -48) go(index + 1);
            };
            target.addEventListener('pointerup', finish);
          }}
        >
          {slides.map((slide, slideIndex) => (
            <div className="home-promo-slide" key={slide.src} aria-hidden={slideIndex !== index}>
              <Link
                href={slide.href}
                tabIndex={slideIndex === index ? 0 : -1}
                onClick={(event) => {
                  if (Math.abs(drag.current) > 48) event.preventDefault();
                }}
              >
                <img src={slide.src} alt={slide.alt} width={slide.width} height={slide.height} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button className="home-promo-nav is-prev" type="button" aria-label={`Previous ${label}`} onClick={() => go(index - 1)}>
        <ChevronLeft size={16} />
      </button>
      <button className="home-promo-nav is-next" type="button" aria-label={`Next ${label}`} onClick={() => go(index + 1)}>
        <ChevronRight size={16} />
      </button>

      <div className="home-promo-dots" role="tablist" aria-label={`${label} slides`}>
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-label={`${slide.alt}`}
            aria-selected={slideIndex === index}
            className={slideIndex === index ? 'is-active' : undefined}
            onClick={() => go(slideIndex)}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeBoardSlider({ className = '' }: { className?: string }) {
  return (
    <section className={`home-board page-width ${className}`.trim()} aria-label="Trip deals">
      <div className="home-board-row">
        <PromoSlider slides={INTERNATIONAL} label="International trips" interval={5200} className="is-international" />
        <PromoSlider slides={DOMESTIC} label="Domestic trips" interval={3800} className="is-domestic" />
      </div>
    </section>
  );
}
