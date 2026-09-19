'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { defaultContent, loadContent, saveContent } from '@/lib/content-store';
import type { ContentDraft, OfferDraft } from '@/lib/types';
import { formatDateTime } from '@/lib/format';

export default function ContentPage() {
  const { push } = useToast();
  const [draft, setDraft] = useState<ContentDraft>(() => loadContent());

  const update = (patch: Partial<ContentDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const updateOffer = (id: string, patch: Partial<OfferDraft>) => {
    setDraft((prev) => ({
      ...prev,
      offers: prev.offers.map((offer) => (offer.id === id ? { ...offer, ...patch } : offer)),
    }));
  };

  const save = () => {
    const next = saveContent(draft);
    setDraft(next);
    push({ tone: 'ok', title: 'Content draft saved', detail: 'Stored in this browser until CMS API exists.' });
  };

  const reset = () => {
    const next = defaultContent();
    setDraft(next);
    saveContent(next);
    push({ tone: 'info', title: 'Reset to defaults' });
  };

  return (
    <>
      <PageHeader
        title="Content"
        detail="Homepage destinations, offers, and closing band. Saves locally — wire to Trip web next."
        actions={
          <>
            <Button onClick={reset}>Reset</Button>
            <Button variant="primary" onClick={save}>
              Save draft
            </Button>
          </>
        }
      />

      <div className="notice-banner">
        Last saved {formatDateTime(draft.updatedAt)}. Guest site still reads hardcoded components until a shared content
        source is connected.
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Closing band</h3>
          </div>
          <div className="panel-body form-grid">
            <label>
              Quote
              <textarea value={draft.closingQuote} onChange={(e) => update({ closingQuote: e.target.value })} />
            </label>
            <label>
              Attribution
              <input value={draft.closingAttrib} onChange={(e) => update({ closingAttrib: e.target.value })} />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Destinations rail</h3>
          </div>
          <div className="panel-body form-grid">
            <label>
              Featured cities (comma-separated)
              <textarea value={draft.destinations} onChange={(e) => update({ destinations: e.target.value })} />
            </label>
            <p className="muted" style={{ margin: 0 }}>
              Order here will drive “Where to next” once the web app reads this draft.
            </p>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head">
          <h3>Offer cards</h3>
          <span className="muted">{draft.offers.filter((o) => o.live).length} live</span>
        </div>
        <div className="panel-body">
          {draft.offers.map((offer) => (
            <div className="offer-editor-row" key={offer.id}>
              <div className="form-grid">
                <label>
                  Eyebrow
                  <input value={offer.eyebrow} onChange={(e) => updateOffer(offer.id, { eyebrow: e.target.value })} />
                </label>
                <label>
                  Title
                  <input value={offer.title} onChange={(e) => updateOffer(offer.id, { title: e.target.value })} />
                </label>
                <label>
                  Detail
                  <input value={offer.detail} onChange={(e) => updateOffer(offer.id, { detail: e.target.value })} />
                </label>
                <label>
                  Link
                  <input value={offer.href} onChange={(e) => updateOffer(offer.id, { href: e.target.value })} />
                </label>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={offer.live}
                  onChange={(e) => updateOffer(offer.id, { live: e.target.checked })}
                />
                Live
              </label>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
