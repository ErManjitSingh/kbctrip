"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { HotelsSectionHeader } from "@/components/hotels/hotels-section-header";
import type { ExclusiveOffer } from "@/lib/exclusive-offers";

function OfferCard({ title, subtitle, href, image, badge }: Omit<ExclusiveOffer, "id">) {
  return (
    <Link
      href={href}
      className="group relative flex h-[220px] w-full overflow-hidden rounded-3xl sm:h-[240px]"
    >
      <Image
        src={image}
        alt=""
        fill
        unoptimized
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 380px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#081816]/90 via-[#081816]/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          {badge}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0f766e] transition group-hover:bg-[#0f766e] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="line-clamp-2 font-display text-xl font-bold leading-snug tracking-[-0.02em]">{title}</p>
        <p className="mt-1.5 line-clamp-1 text-[13px] text-white/75">{subtitle}</p>
      </div>
    </Link>
  );
}

/** Offers come from the server (or GET /api/offers) — no client fetch, no section shimmer. */
export function HotelsExclusiveOffers({ offers }: { offers: ExclusiveOffer[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="border-y border-[#e6eeec] bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <HotelsSectionHeader
          eyebrow="Save more"
          title="Exclusive offers"
          description="Limited-time deals on stays and packages — grab them before they go."
        />

        <div className="relative mt-8 sm:mt-10">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            slidesPerView={1.08}
            slidesPerGroup={1}
            watchOverflow
            breakpoints={{
              640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 18 },
              1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
            }}
            className="handpicked-hotels-swiper trending-packages-swiper !pb-2"
          >
            {offers.map(({ id, ...cardProps }) => (
              <SwiperSlide key={id} className="h-auto">
                <OfferCard {...cardProps} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
