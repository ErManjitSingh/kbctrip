'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { api, tripWebUrl } from '@/lib/api';
import type { ItineraryDay, MarketplacePackage, MarketplacePackageInput } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader, Spinner } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

type Tab = 'basics' | 'itinerary' | 'policies';

type FormState = {
  title: string;
  slug: string;
  destination: string;
  departureCity: string;
  days: string;
  nights: string;
  priceInr: string;
  category: string;
  badge: string;
  inclusions: string;
  exclusions: string;
  highlights: string;
  photos: string;
  description: string;
  published: boolean;
  sortOrder: string;
  itinerary: ItineraryDay[];
  remarks: string;
  terms: string;
  cancellation: string;
};

const emptyDay = (day: number): ItineraryDay => ({
  day,
  title: '',
  summary: '',
  activities: [],
  stay: '',
  meals: '',
  transfer: '',
});

/** Unotrips-style defaults for new packages (UI copy; saves via KBC API). */
const UNO_DEFAULT_INCLUSIONS =
  'Accommodation as per itinerary, Daily breakfast, Exclusive vehicle transfers, Airport / station pickup & drop, Tolls parking & driver charges, Assistance on arrival';
const UNO_DEFAULT_EXCLUSIONS =
  'Flights / trains, Monument entry & camera fees, Meals not mentioned, Guide charges, Personal expenses, GST if applicable';
const UNO_DEFAULT_HIGHLIGHTS =
  'Handpicked stays, Private transfers, Local experiences, Flexible day plan';
const UNO_DEFAULT_REMARKS =
  'Rates subject to change without notice. Hotels subject to availability — similar category may be provided. Confirmation subject to payment. Extra bed means mattress only.';
const UNO_DEFAULT_TERMS =
  'No refund for unused services. Room allocation depends on hotel availability. Booking requires advance payment. Balance due before travel as per schedule.';
const UNO_DEFAULT_CANCELLATION =
  'Before 30 days: 20% retention. 16–30 days: 35% retention. 10–15 days: 50% retention. Within 7 days: full retention. Token amount non-refundable.';

const emptyForm = (): FormState => ({
  title: '',
  slug: '',
  destination: '',
  departureCity: '',
  days: '5',
  nights: '4',
  priceInr: '',
  category: 'group',
  badge: '',
  inclusions: UNO_DEFAULT_INCLUSIONS,
  exclusions: UNO_DEFAULT_EXCLUSIONS,
  highlights: UNO_DEFAULT_HIGHLIGHTS,
  photos: '/reference/destinations/goa.png',
  description: '',
  published: true,
  sortOrder: '0',
  itinerary: [emptyDay(1), emptyDay(2), emptyDay(3), emptyDay(4), emptyDay(5)],
  remarks: UNO_DEFAULT_REMARKS,
  terms: UNO_DEFAULT_TERMS,
  cancellation: UNO_DEFAULT_CANCELLATION,
});

const fromPackage = (pack: MarketplacePackage): FormState => ({
  title: pack.title,
  slug: pack.slug,
  destination: pack.destination,
  departureCity: pack.departureCity ?? '',
  days: String(pack.days),
  nights: String(pack.nights),
  priceInr: String(Math.round(pack.pricePerPersonMinor / 100)),
  category: pack.category ?? 'group',
  badge: pack.badge ?? '',
  inclusions: (pack.inclusions ?? []).join(', '),
  exclusions: (pack.exclusions ?? []).join(', '),
  highlights: (pack.highlights ?? []).join(', '),
  photos: (pack.photos ?? []).join(', '),
  description: pack.description ?? '',
  published: pack.published,
  sortOrder: String(pack.sortOrder),
  itinerary:
    Array.isArray(pack.itinerary) && pack.itinerary.length > 0
      ? pack.itinerary.map((day, index) => ({
          day: day.day || index + 1,
          title: day.title ?? '',
          summary: day.summary ?? '',
          activities: day.activities ?? [],
          stay: day.stay ?? '',
          meals: day.meals ?? '',
          transfer: day.transfer ?? '',
        }))
      : Array.from({ length: Math.max(1, pack.days) }, (_, i) => emptyDay(i + 1)),
  remarks: UNO_DEFAULT_REMARKS,
  terms: UNO_DEFAULT_TERMS,
  cancellation: UNO_DEFAULT_CANCELLATION,
});

const splitList = (value: string) =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const toPayload = (form: FormState): MarketplacePackageInput => ({
  title: form.title.trim(),
  slug: form.slug.trim() || undefined,
  destination: form.destination.trim(),
  departureCity: form.departureCity.trim() || undefined,
  days: Math.max(1, Number(form.days) || 1),
  nights: Math.max(0, Number(form.nights) || 0),
  pricePerPersonMinor: Math.max(0, Math.round((Number(form.priceInr) || 0) * 100)),
  category: form.category.trim() || undefined,
  badge: form.badge.trim() || undefined,
  inclusions: splitList(form.inclusions),
  exclusions: splitList(form.exclusions),
  highlights: splitList(form.highlights),
  photos: splitList(form.photos),
  description: [
    form.description.trim(),
    form.remarks.trim() ? `\n\nRemarks:\n${form.remarks.trim()}` : '',
    form.terms.trim() ? `\n\nTerms:\n${form.terms.trim()}` : '',
    form.cancellation.trim() ? `\n\nCancellation:\n${form.cancellation.trim()}` : '',
  ]
    .join('')
    .trim() || undefined,
  published: form.published,
  sortOrder: Number(form.sortOrder) || 0,
  itinerary: form.itinerary.map((day, index) => ({
    day: index + 1,
    title: day.title.trim() || `Day ${index + 1}`,
    summary: day.summary.trim(),
    activities: (day.activities ?? []).map((item) => item.trim()).filter(Boolean),
    stay: day.stay?.trim() || undefined,
    meals: day.meals?.trim() || undefined,
    transfer: day.transfer?.trim() || undefined,
  })),
});

export function PackageMaker({ packageId }: { packageId?: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [tab, setTab] = useState<Tab>('basics');
  const [loading, setLoading] = useState(Boolean(packageId));
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const pack = await api.get<MarketplacePackage>(`/platform/marketplace-packages/${packageId}`);
        if (cancelled) return;
        setForm(fromPackage(pack));
        setSavedSlug(pack.slug);
      } catch (err) {
        push({
          tone: 'danger',
          title: 'Failed to load package',
          detail: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [packageId, push]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateDay = (index: number, patch: Partial<ItineraryDay>) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    }));
  };

  const addDay = () => {
    setForm((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, emptyDay(prev.itinerary.length + 1)],
      days: String(prev.itinerary.length + 1),
      nights: String(Math.max(0, prev.itinerary.length)),
    }));
  };

  const removeDay = (index: number) => {
    setForm((prev) => {
      const next = prev.itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
      return {
        ...prev,
        itinerary: next.length ? next : [emptyDay(1)],
        days: String(Math.max(1, next.length)),
        nights: String(Math.max(0, next.length - 1)),
      };
    });
  };

  const syncDaysFromCount = () => {
    const count = Math.max(1, Number(form.days) || 1);
    setForm((prev) => {
      const current = [...prev.itinerary];
      while (current.length < count) current.push(emptyDay(current.length + 1));
      return {
        ...prev,
        days: String(count),
        nights: String(Math.max(0, count - 1)),
        itinerary: current.slice(0, count).map((day, i) => ({ ...day, day: i + 1 })),
      };
    });
  };

  const dayCountLabel = useMemo(() => `${form.itinerary.length} day plan`, [form.itinerary.length]);

  const save = async () => {
    const payload = toPayload(form);
    if (!payload.title || !payload.destination || !payload.pricePerPersonMinor) {
      push({ tone: 'danger', title: 'Missing fields', detail: 'Title, destination, and price are required.' });
      setTab('basics');
      return;
    }
    const itineraryReady = form.itinerary.some(
      (day) => Boolean(day.title.trim() || day.summary.trim()),
    );
    if (form.published && !itineraryReady) {
      push({
        tone: 'danger',
        title: 'Itinerary required',
        detail: 'Add at least one day with a title or summary before publishing. Uncheck Published to save as draft.',
      });
      setTab('itinerary');
      return;
    }
    setBusy(true);
    try {
      if (packageId) {
        const updated = await api.patch<MarketplacePackage>(`/platform/marketplace-packages/${packageId}`, payload);
        setSavedSlug(updated.slug);
        push({ tone: 'ok', title: 'Package saved', detail: 'Basics and itinerary updated.' });
      } else {
        const created = await api.post<MarketplacePackage>('/platform/marketplace-packages', payload);
        push({ tone: 'ok', title: 'Package created' });
        router.replace(`/packages/${created.id}`);
      }
    } catch (err) {
      push({
        tone: 'danger',
        title: 'Save failed',
        detail: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading package maker…" />;

  return (
    <>
      <PageHeader
        title={packageId ? 'Package maker' : 'New package'}
        detail="Build the listing, then shape the day-by-day itinerary guests see on the website."
        actions={
          <>
            <Link href="/packages" className="ghost-link">
              <ArrowLeft size={14} /> Back to list
            </Link>
            {savedSlug ? (
              <a className="text-link" href={`${tripWebUrl()}/packages/${savedSlug}`} target="_blank" rel="noreferrer">
                View on website <ExternalLink size={13} />
              </a>
            ) : null}
            <Button variant="primary" disabled={busy} onClick={() => void save()}>
              {busy ? 'Saving…' : 'Save package'}
            </Button>
          </>
        }
      />

      <div className="maker-status">
        <Badge tone={form.published ? 'ok' : 'warn'}>{form.published ? 'Will be live' : 'Draft'}</Badge>
        <span className="muted">{dayCountLabel}</span>
      </div>

      <div className="tabs">
        <button type="button" className={tab === 'basics' ? 'active' : undefined} onClick={() => setTab('basics')}>
          Package details
        </button>
        <button
          type="button"
          className={tab === 'itinerary' ? 'active' : undefined}
          onClick={() => setTab('itinerary')}
        >
          Itinerary maker
        </button>
        <button
          type="button"
          className={tab === 'policies' ? 'active' : undefined}
          onClick={() => setTab('policies')}
        >
          Policies
        </button>
      </div>

      {tab === 'basics' ? (
        <section className="panel">
          <div className="panel-body form-grid package-form">
            <label>
              Title
              <input value={form.title} onChange={(e) => setField('title', e.target.value)} />
            </label>
            <label>
              Slug
              <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="auto from title" />
            </label>
            <label>
              Destination
              <input value={form.destination} onChange={(e) => setField('destination', e.target.value)} />
            </label>
            <label>
              Departure city
              <input value={form.departureCity} onChange={(e) => setField('departureCity', e.target.value)} />
            </label>
            <label>
              Days
              <input type="number" min={1} value={form.days} onChange={(e) => setField('days', e.target.value)} />
            </label>
            <label>
              Nights
              <input type="number" min={0} value={form.nights} onChange={(e) => setField('nights', e.target.value)} />
            </label>
            <div className="span-2">
              <Button onClick={syncDaysFromCount}>Sync itinerary to {form.days || '—'} days</Button>
            </div>
            <label>
              Price per person (₹)
              <input value={form.priceInr} onChange={(e) => setField('priceInr', e.target.value)} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="group">Group</option>
                <option value="family">Family</option>
                <option value="honeymoon">Honeymoon</option>
                <option value="beach">Beach</option>
                <option value="adventure">Adventure</option>
              </select>
            </label>
            <label>
              Badge
              <input value={form.badge} onChange={(e) => setField('badge', e.target.value)} placeholder="Popular Today" />
            </label>
            <label>
              Sort order
              <input value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
            </label>
            <label className="span-2">
              Highlights (comma-separated)
              <input value={form.highlights} onChange={(e) => setField('highlights', e.target.value)} />
            </label>
            <label className="span-2">
              Inclusions (comma-separated)
              <input value={form.inclusions} onChange={(e) => setField('inclusions', e.target.value)} />
            </label>
            <label className="span-2">
              Exclusions (comma-separated)
              <input value={form.exclusions} onChange={(e) => setField('exclusions', e.target.value)} />
            </label>
            <label className="span-2">
              Photo URLs / paths (comma-separated)
              <input value={form.photos} onChange={(e) => setField('photos', e.target.value)} />
            </label>
            <label className="span-2">
              Description
              <textarea rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </label>
            <label className="toggle span-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setField('published', e.target.checked)}
              />
              Show on website
            </label>
          </div>
        </section>
      ) : null}

      {tab === 'itinerary' ? (
        <section className="panel">
          <div className="panel-head">
            <h3>Itinerary maker</h3>
            <Button variant="primary" onClick={addDay}>
              <Plus size={14} /> Add day
            </Button>
          </div>
          <div className="panel-body itinerary-maker">
            {form.itinerary.map((day, index) => (
              <article key={`day-${index}`} className="itinerary-day-card">
                <header>
                  <strong>Day {index + 1}</strong>
                  <button type="button" className="icon-danger" aria-label="Remove day" onClick={() => removeDay(index)}>
                    <Trash2 size={15} />
                  </button>
                </header>
                <div className="form-grid package-form">
                  <label className="span-2">
                    Title
                    <input
                      value={day.title}
                      onChange={(e) => updateDay(index, { title: e.target.value })}
                      placeholder="Arrival & check-in"
                    />
                  </label>
                  <label className="span-2">
                    Day summary
                    <textarea
                      rows={3}
                      value={day.summary}
                      onChange={(e) => updateDay(index, { summary: e.target.value })}
                      placeholder="What happens on this day…"
                    />
                  </label>
                  <label className="span-2">
                    Activities (comma-separated)
                    <input
                      value={(day.activities ?? []).join(', ')}
                      onChange={(e) => updateDay(index, { activities: splitList(e.target.value) })}
                      placeholder="Sightseeing, Local market, Dinner"
                    />
                  </label>
                  <label>
                    Stay
                    <input
                      value={day.stay ?? ''}
                      onChange={(e) => updateDay(index, { stay: e.target.value })}
                      placeholder="Hotel name / overnight"
                    />
                  </label>
                  <label>
                    Meals
                    <input
                      value={day.meals ?? ''}
                      onChange={(e) => updateDay(index, { meals: e.target.value })}
                      placeholder="Breakfast, Dinner"
                    />
                  </label>
                  <label className="span-2">
                    Transfer
                    <input
                      value={day.transfer ?? ''}
                      onChange={(e) => updateDay(index, { transfer: e.target.value })}
                      placeholder="Airport pickup · Sedan · 4 hrs"
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'policies' ? (
        <section className="panel">
          <div className="panel-head">
            <h3>Package policies</h3>
            <span className="muted">Unotrips-style defaults — merged into description on save.</span>
          </div>
          <div className="panel-body form-grid package-form">
            <label className="span-2">
              Remarks
              <textarea rows={4} value={form.remarks} onChange={(e) => setField('remarks', e.target.value)} />
            </label>
            <label className="span-2">
              Terms &amp; conditions
              <textarea rows={4} value={form.terms} onChange={(e) => setField('terms', e.target.value)} />
            </label>
            <label className="span-2">
              Cancellation policy
              <textarea rows={4} value={form.cancellation} onChange={(e) => setField('cancellation', e.target.value)} />
            </label>
          </div>
        </section>
      ) : null}
    </>
  );
}
