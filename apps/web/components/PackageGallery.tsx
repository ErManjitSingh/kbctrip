'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export function PackageGallery({
  photos,
  badge,
  caption,
  brochureHref,
}: {
  photos: string[];
  badge?: string | null;
  caption?: string;
  brochureHref?: string;
}) {
  const list = photos.length ? photos : ['/reference/service-cards/packages.png'];
  const [index, setIndex] = useState(0);
  const total = list.length;
  const current = list[index] ?? list[0]!;

  return (
    <div className="pkgd-gallery">
      <div className="pkgd-gallery-hero">
        <Image src={current} alt="" fill priority sizes="(max-width: 980px) 100vw, 70vw" />
        {badge ? <em className="pkgd-gal-badge">{badge}</em> : null}
        {brochureHref ? (
          <a href={brochureHref} className="pkgd-gal-brochure">
            <FileText size={14} /> View Trip Brochure
          </a>
        ) : null}
        {caption ? <p className="pkgd-gal-caption">{caption}</p> : null}
        {total > 1 ? (
          <>
            <button
              type="button"
              className="pkgd-gal-nav is-prev"
              aria-label="Previous image"
              onClick={() => setIndex((i) => (i - 1 + total) % total)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="pkgd-gal-nav is-next"
              aria-label="Next image"
              onClick={() => setIndex((i) => (i + 1) % total)}
            >
              <ChevronRight size={18} />
            </button>
            <span className="pkgd-gal-count">
              {index + 1} / {total}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
