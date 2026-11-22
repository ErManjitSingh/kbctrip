"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import type { ExclusiveOffer } from "@/lib/exclusive-offers";

function OfferCard({ title, subtitle, href, image, badge }: Omit<ExclusiveOffer, "id">) {
  return (
    <Link
      href={href}
      className="group relative flex h-[180px] w-full overflow-hidden rounded-xl border border-[#e8e8e8] shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:h-[200px]"
    >
      <Image
        src={image}
        alt=""
        fill
        unoptimized
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 380px"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        <span className="w-fit rounded bg-[#ef6c00] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          {badge}
        </span>
        <div>
          <p className="line-clamp-2 text-[16px] font-bold leading-snug sm:text-[17px]">{title}</p>
          <p className="mt-1 line-clamp-1 text-[12px] text-white/85">{subtitle}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-white">
            Book Now
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HotelsExclusiveOffers({ offers }: { offers: ExclusiveOffer[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa] py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
        <div className="relative">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={14}
            slidesPerView={1.08}
            slidesPerGroup={1}
            watchOverflow
            breakpoints={{
              640: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 16 },
              1024: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 18 },
            }}
            className="handpicked-hotels-swiper trending-packages-swiper !pb-1"
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
