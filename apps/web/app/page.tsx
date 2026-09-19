'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, Building2, Car, MapPin, Utensils } from 'lucide-react';
import { TravelSearch } from '../components/TravelSearch';
import { DestinationShowcase } from '../components/DestinationShowcase';
import { OfferShowcase } from '../components/OfferShowcase';
import { ServiceCards } from '../components/ServiceCards';
import { ClosingBand } from '../components/ClosingBand';
import { SiteFooter } from '../components/SiteFooter';
import './kbc-home.css';

const PLANNER_CHIPS = [
  "Delhi to Shimla, 4 days, under ₹20,000",
  "Couple's Manali weekend with private cab",
  "Jaipur 3 nights, heritage stay, mid-range",
] as const;

const PLAN_LINES = [
  { Icon: Building2, label: 'Boutique stay near the Mall Road' },
  { Icon: Car, label: 'Private sedan for sightseeing days' },
  { Icon: Utensils, label: 'Breakfast included · dinner add-ons' },
  { Icon: MapPin, label: 'Kufri + Jakhoo on the ridge days' },
] as const;

export default function HomePage() {
  const [plannerPrompt, setPlannerPrompt] = useState(PLANNER_CHIPS[0]);
  const [planReady, setPlanReady] = useState(true);
  const [isPending, startTransition] = useTransition();

  const buildPlan = () => {
    startTransition(() => {
      setPlanReady(Boolean(plannerPrompt.trim()));
    });
  };

  return (
    <div className="kbc-shell">
      <main>
        <section className="page-width hero">
          <div className="hero-copy">
            <h1>Book <em>everything.</em><br />Travel <em>everywhere.</em></h1>
            <p>Private stays, considered itineraries, one account. India first — then the rest of the map.</p>
            <Image className="trusted-hero" src="/reference/trusted-hero.png" alt="Trusted by 1.2 million happy travellers" width={190} height={44} />
          </div>
          <div className="hero-art" aria-hidden="true">
            <Image src="/reference/hero-visual-hd.png" alt="" fill priority unoptimized sizes="(max-width: 900px) 100vw, 58vw" />
          </div>
        </section>

        <TravelSearch />

        <DestinationShowcase />

        <OfferShowcase />

        <section className="page-width trip-sketch" aria-labelledby="trip-sketch-title">
          <header className="trip-sketch-head">
            <p>Trip sketch</p>
            <h2 id="trip-sketch-title">Describe the trip. We&apos;ll assemble it.</h2>
            <p>Hotels, transfer, and ridge days — shaped to your route and budget.</p>
          </header>

          <div className="trip-sketch-stage">
            <figure className="trip-sketch-visual">
              <Image
                src="/images/brochure-shimla-church.png"
                alt="Shimla ridge and Christ Church at dusk"
                fill
                unoptimized
                sizes="(max-width: 900px) 100vw, 46vw"
                className="trip-sketch-photo"
              />
              <figcaption>
                <span>Sample route</span>
                <strong>Delhi → Shimla</strong>
                <em>4 days · hills</em>
              </figcaption>
            </figure>

            <div className="trip-sketch-compose">
              <label htmlFor="trip-planner-prompt">Your brief</label>
              <textarea
                id="trip-planner-prompt"
                value={plannerPrompt}
                onChange={(event) => {
                  setPlannerPrompt(event.target.value);
                  setPlanReady(false);
                }}
                rows={4}
                placeholder="Where from, where to, how many days, and a budget…"
              />
              <div className="trip-sketch-chips" role="group" aria-label="Try a prompt">
                {PLANNER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={plannerPrompt === chip ? 'is-active' : undefined}
                    onClick={() => {
                      setPlannerPrompt(chip);
                      setPlanReady(false);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <button type="button" className="trip-sketch-build" onClick={buildPlan} disabled={isPending}>
                {isPending ? 'Assembling…' : 'Build my plan'}
                <ArrowRight size={16} aria-hidden />
              </button>
            </div>

            <aside className={`trip-sketch-plan${planReady ? ' is-live' : ''}`} aria-live="polite">
              {planReady ? (
                <>
                  <div className="trip-sketch-plan-meta">
                    <span>Assembled plan</span>
                    <strong>₹18,400</strong>
                  </div>
                  <h3>Four days on the Shimla ridge</h3>
                  <ol>
                    {PLAN_LINES.map(({ Icon, label }) => (
                      <li key={label}>
                        <span className="trip-sketch-plan-icon" aria-hidden>
                          <Icon size={15} strokeWidth={1.75} />
                        </span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="trip-sketch-budget">Keeps a buffer under ₹20,000 for two.</p>
                  <Link href="/packages" className="trip-sketch-cta">
                    Explore matching packages
                    <ArrowRight size={15} aria-hidden />
                  </Link>
                </>
              ) : (
                <div className="trip-sketch-plan-empty">
                  <p>Your plan appears here — stay, cab, meals, and the days that matter.</p>
                </div>
              )}
            </aside>
          </div>
        </section>

        <ServiceCards />
        <ClosingBand />
      </main>
      <SiteFooter />
    </div>
  );
}
