'use client'

/**
 * src/components/admin/wizard/WizardStep1.tsx
 * Step 1 — Basic Info
 * Property owner, name, collection type, property type, star rating, rooms, description.
 * All emojis replaced with custom SVG icons from ./icons.
 */

import { useEffect, useState, useRef } from 'react'
import { tokens }          from '@/lib/tokens'
import { adminPartnersApi } from '@/lib/hotels-wizard-api'
import type { AdminPartner } from '@/lib/hotels-wizard-types'
import type { WizardData, PropertyType, CollectionType } from './types'
import {
  HotelIcon, ResortIcon, BoutiqueIcon, HeritageIcon,
  VillaIcon, HomestayIcon, ServiceAptIcon, HostelIcon,
  UnoOwnIcon, PartnerIcon, CheckIcon,
} from './icons'

// ── Constants ─────────────────────────────────────────────────────────────────

const UNO_HOTELS_PARTNER_ID   = '5c867fda-4682-434d-a569-c1ac72184a64'
const UNO_HOTELS_PARTNER_NAME = 'KBC Trip Hotels & Resorts'

const PROPERTY_TYPES: { value: PropertyType; label: string; Icon: React.FC<{ color: string; size: number }> }[] = [
  { value: 'hotel',             label: 'Hotel',          Icon: HotelIcon        },
  { value: 'resort',            label: 'Resort',         Icon: ResortIcon       },
  { value: 'boutique_hotel',    label: 'Boutique Hotel', Icon: BoutiqueIcon     },
  { value: 'heritage_hotel',    label: 'Heritage Hotel', Icon: HeritageIcon     },
  { value: 'villa',             label: 'Villa',          Icon: VillaIcon        },
  { value: 'homestay',          label: 'Homestay',       Icon: HomestayIcon     },
  { value: 'service_apartment', label: 'Service Apt.',   Icon: ServiceAptIcon   },
  { value: 'hostel',            label: 'Hostel',         Icon: HostelIcon       },
]

const COLLECTIONS: {
  value:  CollectionType
  label:  string
  desc:   string
  color:  string
  bg:     string
  border: string
}[] = [
  { value: 'uno_serviced',  label: 'Uno Serviced',  desc: 'Directly operated by KBC Trip Hotels', color: tokens.goldText,  bg: tokens.goldLight,  border: tokens.goldBorder  },
  { value: 'uno_preferred', label: 'Uno Preferred', desc: 'Certified premium partner',       color: tokens.greenText, bg: tokens.greenLight, border: tokens.greenBorder },
  { value: 'uno_partner',   label: 'Uno Partner',   desc: 'Listed third-party property',     color: tokens.blueText,  bg: tokens.blueLight,  border: tokens.blueBorder  },
]

// ── Shared styles ─────────────────────────────────────────────────────────────

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', padding: '11px 14px', fontSize: 14,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
  fontFamily: tokens.font.sans, color: tokens.text,
  outline: 'none', boxSizing: 'border-box', background: tokens.white, ...extra,
})

const LBL: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: tokens.text,
  letterSpacing: '0.02em', display: 'block', marginBottom: 8,
}

const HINT: React.CSSProperties = {
  fontSize: 12, color: tokens.text2, margin: '5px 0 0', lineHeight: 1.5,
}

type OwnerMode = 'own' | 'partner'

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: WizardData
  set:  <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
  // Markup Management -- resolved value + source per channel, from the
  // same GET /admin/v1/properties/{id} call that populated `data`.
  // Null while loading, or for a brand-new property not yet saved.
  effectiveMarkup?: Record<'website' | 'staff' | 'agent', {
    markup_percent: number
    markup_source:  'property' | 'state' | 'global'
  }> | null
}

export default function WizardStep1({ data, set, effectiveMarkup }: Props) {
  const [mode,     setMode]     = useState<OwnerMode>('own')
  const [partners, setPartners] = useState<AdminPartner[]>([])
  const [loading,  setLoading]  = useState(false)
  const [search,   setSearch]   = useState('')
  const [open,     setOpen]     = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data.partner_id) set('partner_id', UNO_HOTELS_PARTNER_ID)
  }, [])

  useEffect(() => {
    if (mode === 'partner' && partners.length === 0) {
      setLoading(true)
      adminPartnersApi.list({ limit: 200 })
        .then(res => setPartners(res.items.filter(p => p.id !== UNO_HOTELS_PARTNER_ID)))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [mode])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function switchMode(m: OwnerMode) {
    setMode(m)
    set('partner_id', m === 'own' ? UNO_HOTELS_PARTNER_ID : '')
    setOpen(false)
    setSearch('')
  }

  const filtered       = partners.filter(p =>
    p.business_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.business_email ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const selectedPartner = mode === 'partner' ? partners.find(p => p.id === data.partner_id) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Property owner ────────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Property Owner <span style={{ color: tokens.red }}>*</span></label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {/* Own */}
          <button type="button" onClick={() => switchMode('own')} style={{
            padding: '18px 20px', borderRadius: tokens.radius.md, cursor: 'pointer',
            fontFamily: tokens.font.sans, textAlign: 'left',
            border: `2px solid ${mode === 'own' ? tokens.goldBorder : tokens.border}`,
            background: mode === 'own' ? tokens.goldLight : tokens.surface,
            transition: 'all 0.15s',
          }}>
            <div style={{ marginBottom: 10 }}>
              <UnoOwnIcon color={mode === 'own' ? tokens.goldText : tokens.text2} size={26} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: mode === 'own' ? tokens.goldText : tokens.text }}>
              List as KBC Trip Hotels
            </div>
            <div style={{ fontSize: 12, color: mode === 'own' ? tokens.goldText : tokens.text2, marginTop: 4, opacity: 0.85 }}>
              Property listed under platform&apos;s own account
            </div>
          </button>

          {/* Partner */}
          <button type="button" onClick={() => switchMode('partner')} style={{
            padding: '18px 20px', borderRadius: tokens.radius.md, cursor: 'pointer',
            fontFamily: tokens.font.sans, textAlign: 'left',
            border: `2px solid ${mode === 'partner' ? tokens.blueBorder : tokens.border}`,
            background: mode === 'partner' ? tokens.blueLight : tokens.surface,
            transition: 'all 0.15s',
          }}>
            <div style={{ marginBottom: 10 }}>
              <PartnerIcon color={mode === 'partner' ? tokens.blueText : tokens.text2} size={26} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: mode === 'partner' ? tokens.blueText : tokens.text }}>
              List for a Partner
            </div>
            <div style={{ fontSize: 12, color: mode === 'partner' ? tokens.blueText : tokens.text2, marginTop: 4, opacity: 0.85 }}>
              Select which partner owns this property
            </div>
          </button>
        </div>

        {/* Own confirmation */}
        {mode === 'own' && (
          <div style={{
            padding: '12px 16px', background: tokens.goldLight,
            border: `1px solid ${tokens.goldBorder}`, borderRadius: tokens.radius.md,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <CheckIcon color={tokens.goldText} size={16} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.goldText }}>{UNO_HOTELS_PARTNER_NAME}</div>
              <div style={{ fontSize: 11, color: tokens.goldText, opacity: 0.75, fontFamily: 'monospace', marginTop: 2 }}>
                {UNO_HOTELS_PARTNER_ID}
              </div>
            </div>
          </div>
        )}

        {/* Partner dropdown */}
        {mode === 'partner' && (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button type="button" onClick={() => { setOpen(o => !o); setSearch('') }} style={{
              ...inp(),
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', textAlign: 'left',
              border: `1px solid ${open ? tokens.gold : selectedPartner ? tokens.greenBorder : tokens.border}`,
              background: selectedPartner ? tokens.greenLight : tokens.white,
            }}>
              {loading ? (
                <span style={{ color: tokens.text2 }}>Loading partners…</span>
              ) : selectedPartner ? (
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 700, color: tokens.text, fontSize: 14 }}>{selectedPartner.business_name}</span>
                  <span style={{ fontSize: 12, color: tokens.text2 }}>{selectedPartner.business_email}</span>
                </span>
              ) : (
                <span style={{ color: tokens.text2 }}>Select a partner…</span>
              )}
              <span style={{ color: tokens.text2, fontSize: 11, flexShrink: 0, marginLeft: 8 }}>
                {open ? '▲' : '▼'}
              </span>
            </button>

            {open && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 99,
                background: tokens.white, border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radius.md, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                maxHeight: 300, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${tokens.border}` }}>
                  <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    style={{ width: '100%', padding: '8px 11px', fontSize: 13, border: `1px solid ${tokens.border}`,
                      borderRadius: tokens.radius.sm, outline: 'none', fontFamily: tokens.font.sans, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {filtered.length === 0 ? (
                    <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: tokens.text2 }}>
                      {partners.length === 0 ? 'No partners found' : 'No match'}
                    </div>
                  ) : filtered.map(p => {
                    const sel = p.id === data.partner_id
                    return (
                      <div key={p.id} onClick={() => { set('partner_id', p.id); setOpen(false); setSearch('') }}
                        style={{
                          padding: '11px 14px', cursor: 'pointer',
                          background: sel ? tokens.greenLight : 'transparent',
                          borderBottom: `0.5px solid ${tokens.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = tokens.surface }}
                        onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{p.business_name}</div>
                          <div style={{ fontSize: 12, color: tokens.text2, marginTop: 2 }}>{p.business_email}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                          background: tokens.greenLight, color: tokens.greenText, border: `1px solid ${tokens.greenBorder}` }}>
                          {p.property_count} props
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {selectedPartner && (
              <p style={{ fontSize: 11, color: tokens.text2, margin: '5px 0 0', fontFamily: 'monospace' }}>
                ID: {selectedPartner.id}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Property name ────────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Property Name <span style={{ color: tokens.red }}>*</span></label>
        <input style={inp()} value={data.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. The Grand Uno Palace"
          onFocus={e => (e.currentTarget.style.borderColor = tokens.gold)}
          onBlur={e => (e.currentTarget.style.borderColor = tokens.border)}
        />
      </div>

      {/* ── Collection type ──────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Collection Type <span style={{ color: tokens.red }}>*</span></label>
        <p style={HINT}>As admin you assign the collection directly — determines the badge on the live listing.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
          {COLLECTIONS.map(c => {
            const active = data.collection_type === c.value
            return (
              <button key={c.value} type="button" onClick={() => set('collection_type', c.value)} style={{
                padding: '16px 18px', borderRadius: tokens.radius.md, cursor: 'pointer',
                fontFamily: tokens.font.sans, textAlign: 'left',
                border: `2px solid ${active ? c.border : tokens.border}`,
                background: active ? c.bg : tokens.surface,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: active ? c.color : tokens.text, marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 12, color: active ? c.color : tokens.text2, opacity: 0.85 }}>{c.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Property type ────────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Property Type <span style={{ color: tokens.red }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {PROPERTY_TYPES.map(t => {
            const active = data.property_type === t.value
            return (
              <button key={t.value} type="button" onClick={() => set('property_type', t.value)} style={{
                padding: '16px 10px', borderRadius: tokens.radius.md,
                border: `2px solid ${active ? tokens.text : tokens.border}`,
                background: active ? tokens.text : tokens.surface,
                cursor: 'pointer', fontFamily: tokens.font.sans,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                fontSize: 12, fontWeight: active ? 700 : 500, transition: 'all 0.15s',
                color: active ? tokens.white : tokens.text,
              }}>
                <t.Icon color={active ? '#ffffff' : tokens.text2} size={22} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Star category ────────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Star Category</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(s => {
            const active = data.star_category === s
            return (
              <button key={s} type="button" onClick={() => set('star_category', s)} style={{
                padding: '0 20px', height: 42, borderRadius: tokens.radius.sm,
                border: `2px solid ${active ? tokens.gold : tokens.border}`,
                background: active ? tokens.goldLight : tokens.surface,
                color: active ? tokens.goldText : tokens.text2,
                cursor: 'pointer', fontFamily: tokens.font.sans,
                fontWeight: 700, fontSize: 14, transition: 'all 0.15s',
              }}>
                {'★'.repeat(s)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Markup Management (Pricing Engine — Property-level override) ──── */}
      <div>
        <label style={LBL}>Markup Management</label>
        <p style={HINT}>
          Overrides the state and global default markup for this property only.
          Leave a channel blank to inherit — the resolved value each channel is
          actually using right now is shown below, with where it came from.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
          {(['website', 'staff', 'agent'] as const).map(channel => {
            const field = `${channel}_markup_percent` as const
            const raw = data[field]
            const resolved = effectiveMarkup?.[channel]
            return (
              <div key={channel} style={{
                padding: '12px 14px', borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.border}`, background: tokens.surface,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: tokens.text, marginBottom: 8, textTransform: 'capitalize' }}>
                  {channel}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    type="number" step={0.1} min={0} max={500}
                    value={raw ?? ''}
                    placeholder="Inherit"
                    onChange={e => {
                      const v = e.target.value
                      set(field, v === '' ? null : parseFloat(v))
                    }}
                    style={inp({ width: 90, textAlign: 'center', fontWeight: 700 })}
                  />
                  <span style={{ fontSize: 13, color: tokens.text2, fontWeight: 600 }}>%</span>
                  {raw !== null && (
                    <button
                      type="button"
                      onClick={() => set(field, null)}
                      title="Clear override — inherit from State/Global instead"
                      style={{
                        marginLeft: 'auto', fontSize: 11, color: tokens.text3,
                        background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {/* Effective Markup — resolved value + source, exactly as
                    PricingEngine.resolve_markup_only() returned it. Never
                    computed here — this is a direct render of the backend's
                    answer, including when it disagrees with `raw` above
                    (e.g. raw is set here but a State/Global change hasn't
                    been re-fetched yet). */}
                {resolved ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 8px', borderRadius: tokens.radius.sm,
                    background: resolved.markup_source === 'property' ? tokens.goldLight : tokens.blueLight,
                    border: `1px solid ${resolved.markup_source === 'property' ? tokens.goldBorder : tokens.blueBorder}`,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                      color: resolved.markup_source === 'property' ? tokens.goldText : tokens.blueText,
                    }}>
                      {resolved.markup_source === 'property' ? 'This property' : resolved.markup_source === 'state' ? 'Inherited: State' : 'Inherited: Global'}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: tokens.text }}>
                      {resolved.markup_percent.toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: tokens.text3, fontStyle: 'italic' }}>
                    Effective markup unavailable — save the property first.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Total rooms ──────────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Total Rooms <span style={{ color: tokens.red }}>*</span></label>
        <input style={inp({ width: 160 })} type="number" min={1}
          value={data.total_rooms || ''}
          onChange={e => set('total_rooms', Number(e.target.value))}
          placeholder="e.g. 45"
          onFocus={e => (e.currentTarget.style.borderColor = tokens.gold)}
          onBlur={e => (e.currentTarget.style.borderColor = tokens.border)}
        />
        <p style={HINT}>Overall capacity across all room types</p>
      </div>

      {/* ── Description ──────────────────────────────────────────────────── */}
      <div>
        <label style={LBL}>Description <span style={{ color: tokens.red }}>*</span></label>
        <textarea style={{ ...inp(), resize: 'vertical', lineHeight: 1.7, fontSize: 14 }}
          rows={5} maxLength={2500}
          value={data.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Describe the property — location highlights, unique features, what makes it special for guests..."
          onFocus={e => (e.currentTarget.style.borderColor = tokens.gold)}
          onBlur={e => (e.currentTarget.style.borderColor = tokens.border)}
        />
        <p style={{ ...HINT, textAlign: 'right', color: data.description.length > 2200 ? tokens.amber : tokens.text2 }}>
          {data.description.length} / 2500
        </p>
      </div>
    </div>
  )
}