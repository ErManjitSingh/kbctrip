'use client'

import { tokens } from '@/lib/tokens'
import type { WizardData } from './types'
import { INDIAN_STATES } from '@/lib/indianStates'

// STATES sourced from the shared canonical list -- see src/lib/indianStates.ts
// for why this must stay a single source of truth shared with State Pricing.
const STATES = INDIAN_STATES

interface Props {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: tokens.text2,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  display: 'block', marginBottom: 7,
}

const inpStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', fontSize: 13,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
  fontFamily: tokens.font.sans, color: tokens.text, outline: 'none',
  boxSizing: 'border-box', background: tokens.white, ...extra,
})

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

export default function WizardStep2({ data, set }: Props) {
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = tokens.gold)
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = tokens.border)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <Field label="Street Address *">
        <input
          style={inpStyle()} value={data.address}
          onChange={e => set('address', e.target.value)}
          placeholder="123, Marine Drive"
          onFocus={focus} onBlur={blur}
        />
      </Field>

      <Field label="Landmark / Area Name">
        <input
          style={inpStyle()} value={data.landmark}
          onChange={e => set('landmark', e.target.value)}
          placeholder="e.g. Near City Palace, Beachfront"
          onFocus={focus} onBlur={blur}
        />
        <p style={{ fontSize: 11, color: tokens.text3, margin: '4px 0 0' }}>Helps guests find and recognise your location</p>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="City *">
          <input
            style={inpStyle()} value={data.city}
            onChange={e => set('city', e.target.value)}
            placeholder="Mumbai"
            onFocus={focus} onBlur={blur}
          />
        </Field>
        <Field label="State *">
          <select
            style={inpStyle({ height: 41, padding: '0 14px', cursor: 'pointer' })}
            value={data.state} onChange={e => set('state', e.target.value)}
            onFocus={focus} onBlur={blur}
          >
            <option value="">Select state</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
        <Field label="Pincode">
          <input
            style={inpStyle()} value={data.pincode} maxLength={6}
            onChange={e => set('pincode', e.target.value)}
            placeholder="400001"
            onFocus={focus} onBlur={blur}
          />
        </Field>
        <div />
      </div>
    </div>
  )
}