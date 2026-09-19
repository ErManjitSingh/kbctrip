"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Percent, Sparkles } from "lucide-react";
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
      className="group relative flex h-[200px] w-full overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_12px_36px_-14px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_44px_-14px_rgba(15,118,110,0.35)] sm:h-[220px]"
    >
      <Image
        src={image}
        alt=""
        fill
        unoptimized
        priority
        className="object-cover transition duration-700 group-hover:scale-110"
        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 400px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
        <span className="inline-flex items-center gap-1 rounded-md bg-teal-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
          <Sparkles className="h-3 w-3" aria-hidden />
          {badge}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-md transition group-hover:scale-110">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="line-clamp-2 text-lg font-bold leading-snug">{title}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
          <Percent className="h-3.5 w-3.5 shrink-0 text-teal-200" aria-hidden />
          <span className="line-clamp-1">{subtitle}</span>
        </p>
      </div>
    </Link>
  );
}

/** Offers come from the server (or GET /api/offers) — no client fetch, no section shimmer. */
export function HotelsExclusiveOffers({ offers }: { offers: ExclusiveOffer[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="border-b border-slate-200/60 bg-gradient-to-b from-white to-teal-50/40 py-10 sm:py-12 lg:py-14">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <HotelsSectionHeader
          eyebrow="Save more"
          title="Exclusive Offers"
          description="Limited-time deals on top hotels and holiday packages — grab them before they are gone."
        />

        <div className="relative mt-6 sm:mt-8">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={14}
            slidesPerView={1.08}
            slidesPerGroup={1}
            watchOverflow
            breakpoints={{
              640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 18 },
            }}
            className="handpicked-hotels-swiper trending-packages-swiper !pb-3 !pt-1"
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
