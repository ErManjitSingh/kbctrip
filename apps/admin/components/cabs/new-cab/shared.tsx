'use client'
// src/components/admin/cabs/new-cab/types.ts
// Shared types, constants and tiny UI atoms used across all new-cab step components.

import { CSSProperties, ReactNode, useState } from 'react'
import { tokens } from '@/lib/tokens'

// ─── Season date range (local state only, not persisted until form save) ───────

export type SeasonType = 'in_season' | 'off_season'

export interface SeasonDateRange {
  id:          string   // local temp id (never sent to server)
  season_type: SeasonType
  date_from:   string   // YYYY-MM-DD
  date_to:     string   // YYYY-MM-DD
  rate:        number
  label:       string
}

// ─── Form state passed between steps ─────────────────────────────────────────

export interface NewCabFormState {
  // Step 1 — Cab Details
  name:        string
  slug:        string
  slugEdited:  boolean
  shortDesc:   string
  cabCategory: string
  ownerId:     string
  isActive:    boolean
  isFeatured:  boolean
  // Step 2 — Specs
  seatingCap:  number
  luggageCap:  number
  isAc:        boolean
  fuelType:    string
  permitType:  string
  features:    string[]
  serviceTypes:string[]
  // Step 3 — Pricing (package)
  standardDayRate:  number
  inSeasonRanges:   SeasonDateRange[]
  offSeasonRanges:  SeasonDateRange[]
  // Step 3 — Pricing (website)
  onewayLocalNet:  number
  onewayLocalMgn:  number
  onewayOutNet:    number
  onewayOutMgn:    number
  roundtripNet:    number
  roundtripMgn:    number
  fulldayNet:      number
  fulldayMgn:      number
  fulldayKm:       number
  fulldayHrs:      number
  extraKmNet:      number
  extraHrNet:      number
  offMult:         number
  driverAllowance: number
  nightCharge:     number
  // Step 4 — Driver & Vehicle
  addVehicleNow:  boolean
  regNumber:      string
  vehicleModel:   string
  vehicleColor:   string
  driverName:     string
  driverPhone:    string
  wasSame:        boolean
  driverWhatsapp: string
  driverLicense:  string
  driverPan:      string
  baseCity:       string
  vehicleNotes:   string
  // Step 4 — Owner (optional — for independent listings)
  ownerName:      string
  ownerPhone:     string
  ownerEmail:     string
  // Step 5 — SEO
  seoTitle:    string
  seoDesc:     string
  seoKeywords: string
}

export function defaultFormState(): NewCabFormState {
  return {
    name: '', slug: '', slugEdited: false, shortDesc: '',
    cabCategory: '', ownerId: '', isActive: true, isFeatured: false,
    seatingCap: 4, luggageCap: 2, isAc: true, fuelType: '', permitType: '', features: [], serviceTypes: [],
    standardDayRate: 0, inSeasonRanges: [], offSeasonRanges: [],
    onewayLocalNet: 0, onewayLocalMgn: 20,
    onewayOutNet: 0,   onewayOutMgn: 20,
    roundtripNet: 0,   roundtripMgn: 20,
    fulldayNet: 0,     fulldayMgn: 20,
    fulldayKm: 80,     fulldayHrs: 8,
    extraKmNet: 0,     extraHrNet: 0,
    offMult: 0.85,     driverAllowance: 300, nightCharge: 0,
    addVehicleNow: false,
    regNumber: '', vehicleModel: '', vehicleColor: '',
    driverName: '', driverPhone: '', wasSame: true,
    driverWhatsapp: '', driverLicense: '', driverPan: '',
    baseCity: '', vehicleNotes: '',
    ownerName: '', ownerPhone: '', ownerEmail: '',
    seoTitle: '', seoDesc: '', seoKeywords: '',
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CAB_CATEGORY_SUGGESTIONS = [
  'Sedan', 'SUV', 'MUV', 'Hatchback',
  'Tempo Traveller', 'Mini Bus', 'Luxury', 'Electric',
]

export const FEATURES_OPTIONS = [
  'GPS', 'Music System', 'Reclining Seats',
  'Charging Points', 'First Aid Kit', 'Bottle Water', 'Blanket',
]

export const SERVICE_TYPES_OPTIONS = [
  { value: 'point_to_point',   label: 'Point to Point'   },
  { value: 'full_day_rental',  label: 'Full Day Rental'  },
  { value: 'airport_transfer', label: 'Airport Transfer' },
  { value: 'multi_day',        label: 'Multi Day'        },
]

export const FUEL_TYPE_OPTIONS = [
  { value: '',         label: '— Select —' },
  { value: 'petrol',   label: 'Petrol'     },
  { value: 'diesel',   label: 'Diesel'     },
  { value: 'cng',      label: 'CNG'        },
  { value: 'electric', label: 'Electric'   },
  { value: 'hybrid',   label: 'Hybrid'     },
]

export const PERMIT_TYPE_OPTIONS = [
  { value: '',          label: '— Select —' },
  { value: 'all_india', label: 'All India'  },
  { value: 'state',     label: 'State'      },
  { value: 'tourist',   label: 'Tourist'    },
]

export const SECTIONS = [
  { id: 'basic',   label: '1. Cab Details'      },
  { id: 'specs',   label: '2. Specs & Features' },
  { id: 'pricing', label: '3. Pricing'          },
  { id: 'driver',  label: '4. Driver & Vehicle' },
  { id: 'seo',     label: '5. SEO'              },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

export const inputBase: CSSProperties = {
  width: '100%', padding: '10px 13px', fontSize: 13,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.md,
  outline: 'none', color: tokens.text, background: tokens.white,
  fontFamily: tokens.font.sans, boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export const cardSt: CSSProperties = {
  background: tokens.white, border: `1px solid ${tokens.border}`,
  borderRadius: tokens.radius.lg, padding: '24px 28px', marginBottom: 16,
  boxShadow: tokens.shadow.sm,
}

export const labelSt: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: tokens.text2, marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.04em',
}

export const sectionTitleSt: CSSProperties = {
  fontSize: 15, fontWeight: 800, color: tokens.text, margin: '0 0 20px',
  paddingBottom: 12, borderBottom: `1px solid ${tokens.border}`,
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

export function slugify(t: string): string {
  return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 18px' }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: tokens.orange, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: tokens.border }} />
    </div>
  )
}

export function FField({ label, children, error, hint, required, span = 1 }: {
  label: string; children: ReactNode
  error?: string; hint?: string; required?: boolean; span?: number
}) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={labelSt}>
        {label}{required && <span style={{ color: tokens.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: tokens.red, margin: '4px 0 0' }}>{error}</p>}
      {hint  && <p style={{ fontSize: 11, color: tokens.text3, margin: '4px 0 0' }}>{hint}</p>}
    </div>
  )
}

export function FInput({ value, onChange, placeholder = '', type = 'text', mono = false, error, prefix }: {
  value: string | number; onChange: (v: string) => void
  placeholder?: string; type?: string; mono?: boolean; error?: boolean; prefix?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 13, color: tokens.text3, pointerEvents: 'none',
        }}>{prefix}</span>
      )}
      <input
        type={type} value={String(value)}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputBase,
          borderColor: error ? tokens.red : focused ? tokens.orange : tokens.border,
          fontFamily: mono ? tokens.font.mono : tokens.font.sans,
          paddingLeft: prefix ? 24 : 13,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

export function FTextarea({ value, onChange, placeholder = '', rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6,
        borderColor: focused ? tokens.orange : tokens.border }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  )
}

export function FSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const [focused, setFocused] = useState(false)
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        ...inputBase, appearance: 'auto',
        borderColor: focused ? tokens.orange : tokens.border,
      }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '14px 18px' }}>
      {children}
    </div>
  )
}

export function Toggle({ label, checked, onChange, hint }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string
}) {
  return (
    <div onClick={() => onChange(!checked)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <div style={{
        width: 38, height: 21, borderRadius: 11, flexShrink: 0, marginTop: 2,
        background: checked ? tokens.orange : '#D1D5DB', position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: checked ? 20 : 3,
          width: 15, height: 15, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: tokens.text3, marginTop: 2 }}>{hint}</div>}
      </div>
    </div>
  )
}

export function Chips({ options, selected, onChange }: {
  options: { value: string; label: string }[]
  selected: string[]; onChange: (v: string[]) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const on = selected.includes(o.value)
        return (
          <button key={o.value} type="button"
            onClick={() => onChange(on ? selected.filter(v => v !== o.value) : [...selected, o.value])}
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 600,
              borderRadius: tokens.radius.full, cursor: 'pointer',
              border: `1px solid ${on ? tokens.orangeBorder : tokens.border}`,
              background: on ? tokens.orangeLight : tokens.white,
              color: on ? tokens.orangeText : tokens.text2,
              fontFamily: tokens.font.sans, transition: 'all 0.12s',
            }}
          >
            {on && '✓ '}{o.label}
          </button>
        )
      })}
    </div>
  )
}

export function NumInput({ value, onChange, prefix = '₹' }: {
  value: number; onChange: (v: number) => void; prefix?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        fontSize: 12, color: tokens.text3, pointerEvents: 'none',
      }}>{prefix}</span>
      <input type="number" value={value} step={0.01} min={0}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          ...inputBase, paddingLeft: 22,
          borderColor: focused ? tokens.orange : tokens.border,
          fontFamily: tokens.font.mono,
        }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  )
}