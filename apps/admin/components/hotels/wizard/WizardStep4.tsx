'use client'

import { tokens } from '@/lib/tokens'
import type { WizardData } from './types'

const PAYMENT_OPTIONS = ['Cash','Credit Card','Debit Card','UPI','Net Banking','Cheque']

const POLICY_FIELDS: { key: keyof WizardData; label: string; placeholder: string }[] = [
  { key: 'cancellation',    label: 'Cancellation Policy',    placeholder: 'e.g. Free cancellation up to 24 hours before check-in.' },
  { key: 'children',        label: 'Children Policy',        placeholder: 'e.g. Children of all ages are welcome.' },
  { key: 'pets',            label: 'Pet Policy',             placeholder: 'e.g. Pets are not allowed.' },
  { key: 'smoking',         label: 'Smoking Policy',         placeholder: 'e.g. Non-smoking property.' },
  { key: 'extra_bed',       label: 'Extra Bed Policy',       placeholder: 'e.g. Extra beds available on request at ₹1,500/night.' },
  { key: 'early_check_in',  label: 'Early Check-in Policy',  placeholder: 'e.g. Early check-in from 10:00 AM at ₹500 extra.' },
  { key: 'late_check_out',  label: 'Late Check-out Policy',  placeholder: 'e.g. Late check-out until 2:00 PM on request.' },
  { key: 'age_restriction', label: 'Age Restriction',        placeholder: 'e.g. Guests must be 18+ to check in.' },
  { key: 'alcohol',         label: 'Alcohol Policy',         placeholder: 'e.g. Alcohol served at the bar; outside alcohol not permitted.' },
]

interface Props {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: tokens.text2,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  display: 'block', marginBottom: 7,
}

export default function WizardStep4({ data, set }: Props) {
  function togglePayment(m: string) {
    const cur = data.payment_methods
    set('payment_methods', cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m])
  }

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = tokens.gold)
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = tokens.border)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Check-in / Check-out */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'Check-in Time',  key: 'check_in_time'  as const },
          { label: 'Check-out Time', key: 'check_out_time' as const },
        ].map(({ label, key }) => (
          <div key={key}>
            <label style={lbl}>{label}</label>
            <input
              type="time"
              value={data[key] as string}
              onChange={e => set(key, e.target.value)}
              style={{
                width: '100%', height: 41, padding: '0 14px', fontSize: 13,
                border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
                fontFamily: tokens.font.sans, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={focus} onBlur={blur}
            />
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div>
        <label style={lbl}>Accepted payment methods ({data.payment_methods.length} selected)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PAYMENT_OPTIONS.map(m => {
            const on = data.payment_methods.includes(m)
            return (
              <button key={m} type="button" onClick={() => togglePayment(m)} style={{
                padding: '7px 15px', borderRadius: 9999, fontSize: 12,
                cursor: 'pointer', fontFamily: tokens.font.sans,
                border: `1.5px solid ${on ? tokens.gold : tokens.border}`,
                background: on ? tokens.goldLight : tokens.white,
                color: on ? tokens.goldText : tokens.text2, fontWeight: on ? 600 : 400,
                transition: 'all 0.12s',
              }}>
                {on && '✓ '}{m}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${tokens.border}` }} />

      {/* Policy text areas */}
      {POLICY_FIELDS.map(({ key, label, placeholder }) => (
        <div key={String(key)}>
          <label style={lbl}>{label}</label>
          <textarea
            value={data[key] as string}
            onChange={e => set(key, e.target.value)}
            rows={2} placeholder={placeholder}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 13,
              border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
              fontFamily: tokens.font.sans, color: tokens.text,
              resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
            }}
            onFocus={focus} onBlur={blur}
          />
        </div>
      ))}
    </div>
  )
}
