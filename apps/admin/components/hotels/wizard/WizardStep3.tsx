'use client'

import { useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { WizardData } from './types'

const ALL_AMENITIES = [
  'WiFi','Pool','Spa','Gym','Restaurant','Bar','Parking','Valet Parking',
  'Room Service','Concierge','Laundry','Business Center','Conference Room',
  'Airport Transfer','Kids Club','Pet Friendly','Beach Access','Garden',
  'Terrace','Rooftop','EV Charging','Wheelchair Accessible',
  '24hr Front Desk','Doctor on Call','Kids Pool','Steam Room',
  'Yoga Studio','Library','Currency Exchange','Helipad',
]

const ALL_TAGS = [
  'Luxury','Beachfront','Heritage','Boutique','Family Friendly',
  'Pet Friendly','Romantic','Business','Budget','Eco-friendly',
  'Wellness','Adventure','Adults Only','Wedding Venue','Backpacker',
]

const MAX_TAGS = 2

interface Props {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: tokens.text2,
  letterSpacing: '0.06em', textTransform: 'uppercase',
}

export default function WizardStep3({ data, set }: Props) {
  const [tagWarn, setTagWarn] = useState(false)

  function toggleAmenity(a: string) {
    const cur = data.amenities
    set('amenities', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a])
  }

  function toggleTag(t: string) {
    const cur = data.tags
    if (cur.includes(t)) { setTagWarn(false); set('tags', cur.filter(x => x !== t)); return }
    if (cur.length >= MAX_TAGS) { setTagWarn(true); setTimeout(() => setTagWarn(false), 2500); return }
    setTagWarn(false); set('tags', [...cur, t])
  }

  const pill = (on: boolean, gold?: boolean, blocked?: boolean): React.CSSProperties => ({
    padding: '7px 15px', borderRadius: 9999, fontSize: 12,
    cursor: blocked ? 'not-allowed' : 'pointer', fontFamily: tokens.font.sans,
    border: `1.5px solid ${on ? (gold ? tokens.gold : tokens.text) : tokens.border}`,
    background: on ? (gold ? tokens.goldLight : tokens.text) : tokens.white,
    color: on ? (gold ? tokens.goldText : tokens.white) : blocked ? tokens.text3 : tokens.text2,
    fontWeight: on ? 600 : 400,
    opacity: blocked ? 0.5 : 1,
    transition: 'all 0.12s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Amenities */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Amenities</div>
            <div style={{ fontSize: 12, color: tokens.text2, marginTop: 2 }}>{data.amenities.length} selected</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_AMENITIES.map(a => {
            const on = data.amenities.includes(a)
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)} style={pill(on)}>
                {on && '✓ '}{a}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${tokens.border}` }} />

      {/* Tags */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Property tags</div>
            <div style={{ fontSize: 12, color: tokens.text2, marginTop: 2 }}>Up to {MAX_TAGS} tags — help guests discover this property</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
            background: data.tags.length === MAX_TAGS ? tokens.goldLight : tokens.surface,
            color: data.tags.length === MAX_TAGS ? tokens.goldText : tokens.text2,
            border: `1px solid ${data.tags.length === MAX_TAGS ? tokens.goldBorder : tokens.border}`,
          }}>
            {data.tags.length} / {MAX_TAGS}
          </span>
        </div>

        {tagWarn && (
          <div style={{
            padding: '9px 13px', borderRadius: tokens.radius.sm, marginBottom: 10,
            background: tokens.redLight, border: `1px solid ${tokens.redBorder}`,
            fontSize: 12, color: tokens.redText,
          }}>
            Max {MAX_TAGS} tags allowed — remove one to add another.
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_TAGS.map(t => {
            const on = data.tags.includes(t)
            const blocked = !on && data.tags.length >= MAX_TAGS
            return (
              <button key={t} type="button" onClick={() => toggleTag(t)} style={pill(on, true, blocked)}>
                {t}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
