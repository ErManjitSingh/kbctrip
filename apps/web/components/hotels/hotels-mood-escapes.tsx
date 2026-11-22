"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { hotelResultsHref } from "@/lib/hotels-catalog";

const MOODS = [
  {
    title: "Mountains Calling",
    href: hotelResultsHref("manali"),
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  },
  {
    title: "Beach Vacations",
    href: hotelResultsHref("goa"),
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  },
  {
    title: "Weekend Getaways",
    href: hotelResultsHref("shimla"),
    image: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=900&q=80",
  },
  {
    title: "Wildlife Adventure",
    href: hotelResultsHref("rishikesh"),
    image: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=900&q=80",
  },
] as const;

export function HotelsMoodEscapes() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
        <div className="text-center">
          <h2 className="text-[22px] font-bold tracking-tight text-[#212121] sm:text-[26px]">
            Book Hotels For Every Mood
          </h2>
          <p className="mt-1.5 text-[13px] text-[#757575] sm:text-[14px]">
            Curated Escapes for Your Curious Soul!
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {MOODS.map((mood) => (
            <Link
              key={mood.title}
              href={mood.href}
              className="group relative h-[200px] overflow-hidden rounded-xl sm:h-[230px]"
            >
              <Image
                src={mood.image}
                alt={mood.title}
                fill
                unoptimized
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[16px] font-bold text-white sm:text-[17px]">{mood.title}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-white/90">
                  Explore More
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
