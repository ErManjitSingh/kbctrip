"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import "./cabs-stage.css";

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const STEPS = [
  ["01", "Send the trip", "Pickup, drop, time, and the car. Sign in only when you submit."],
  ["02", "Read the replies", "Each quote names the fare, the vehicle, and what is billed extra."],
  ["03", "Book one", "Pay here, split the fare, or pay the driver. The trip stays on your account."],
] as const;

const FLEET = [
  ["Traveller", "The whole family", "Twelve seats. One booking."],
  ["Sedan", "Airport and city", "Four seats. The quiet option."],
  ["SUV", "Hills and luggage", "Six seats. More boot, same driver."],
] as const;

export function CabsPageStages() {
  const reduce = useReducedMotion();

  return (
    <div className="order-3 bg-[#f3f7f5]">
      <section className="bg-[#f3f7f5] pb-20 pt-14 sm:pb-24 sm:pt-16" aria-labelledby="cab-how-title">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f766e]">How it works</p>
            <h2 id="cab-how-title" className="mt-4 max-w-xl text-[clamp(36px,4.4vw,60px)] font-bold leading-[0.98] tracking-[-0.045em] text-[#0c1210]">
              Send it once. Pick from the replies.
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[28px] bg-[#d7e2dd] sm:grid-cols-3">
            {STEPS.map(([n, title, body], index) => (
              <motion.li
                key={n}
                className="bg-[#f7fbf9] px-7 py-9"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
              >
                <span className="text-[12px] font-bold tracking-[0.16em] text-[#0f766e]">{n}</span>
                <h3 className="mt-6 text-[26px] font-bold tracking-[-0.03em] text-[#0c1210]">{title}</h3>
                <p className="mt-3 max-w-xs text-[15px] leading-7 text-[#5c6562]">{body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="kbc-cab-frame min-h-[78vh]" aria-labelledby="cab-fleet-title">
        <Image
          src="/images/cabs/uno-cabs-partner-fleet-v2.png"
          alt="Sedan, SUV, and traveller waiting outside an airport at night"
          fill
          sizes="100vw"
          className="object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-[#070b0a]/55 to-[#070b0a]/10" />
        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-[1240px] flex-col justify-end px-4 py-14 sm:px-6 sm:py-16">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ae8dc]">The cars</p>
            <h2 id="cab-fleet-title" className="mt-4 max-w-lg text-[clamp(36px,4.4vw,60px)] font-bold leading-[0.98] tracking-[-0.045em] text-white">
              Three replies. One of them is yours.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-3">
            {FLEET.map(([name, use, note], index) => (
              <motion.li
                key={name}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 * index, ease: EASE }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ae8dc]">{use}</p>
                <h3 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-white">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{note}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#0c1210] text-white">
        <div className="mx-auto grid max-w-[1240px] items-end gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:py-24">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ae8dc]">For operators</p>
            <h2 className="mt-4 max-w-xl text-[clamp(36px,4.4vw,60px)] font-bold leading-[0.98] tracking-[-0.045em]">
              Put your cars in front of trips that are ready to book.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-[15px] leading-7 text-white/70">
              Register, add the fleet, and wait for approval. Then you see the route and send your own fare.
            </p>
            <Link href="/cabs/list-your-cab" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0c1210] transition hover:bg-[#e7f3ef]">
              List your cab <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f3f7f5] py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f766e]">Help</p>
            <h2 className="mt-4 text-[clamp(32px,3.6vw,48px)] font-bold leading-[1] tracking-[-0.04em] text-[#0c1210]">Before you post.</h2>
            <a href="mailto:hello@kbctrip.com" className="mt-5 inline-flex text-sm font-semibold text-[#0f766e]">hello@kbctrip.com</a>
          </Reveal>
          <div className="divide-y divide-[#d5e0db] border-y border-[#d5e0db]">
            {[
              ["When do quotes arrive?", "It depends on the route and the date. Replies show up on the request as they come in."],
              ["Does posting book the car?", "No. The trip is booked only after you choose a quote and pay, or choose pay-the-driver."],
              ["Can I add notes?", "Yes. Luggage, a child seat, or a hill pickup can go on the request."],
            ].map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#0c1210]">
                  <span>{q}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#0f766e] transition duration-300 group-open:rotate-90" />
                </summary>
                <p className="mt-3 max-w-xl pr-8 text-[15px] leading-7 text-[#5c6562]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
