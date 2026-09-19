'use client'

import { useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { WizardData, NearbyAttraction, BankDetails } from './types'
import { emptyBankDetails } from './types'

interface Props {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: tokens.text2,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  display: 'block', marginBottom: 7,
}

const inp = (): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', fontSize: 13,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
  fontFamily: tokens.font.sans, color: tokens.text, outline: 'none',
  boxSizing: 'border-box', background: tokens.white,
})

export default function WizardStep5({ data, set }: Props) {
  const [attrName, setAttrName] = useState('')
  const [attrDist, setAttrDist] = useState('')
  const [bankExpanded, setBankExpanded] = useState(false)

  const focus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = tokens.gold)
  const blur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = tokens.border)

  function addAttraction() {
    if (!attrName.trim() || !attrDist.trim()) return
    set('nearby_attractions', [...data.nearby_attractions, { name: attrName.trim(), distance_km: attrDist.trim() }])
    setAttrName(''); setAttrDist('')
  }

  function removeAttraction(i: number) {
    set('nearby_attractions', data.nearby_attractions.filter((_, idx) => idx !== i))
  }

  // Bank details — entirely optional, starts collapsed. Lazily creates
  // an empty BankDetails object on first edit rather than keeping
  // bank_details non-null by default.
  const bankDetails = data.bank_details ?? emptyBankDetails()
  function setBank<K extends keyof BankDetails>(k: K, v: BankDetails[K]) {
    set('bank_details', { ...bankDetails, [k]: v })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Contact details */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Contact details</div>
        <div style={{ fontSize: 12, color: tokens.text2, marginBottom: 16 }}>
          Shown to guests on the property page for reservations and enquiries
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Property Phone *</label>
              <input style={inp()} type="tel" value={data.contact_phone}
                onChange={e => set('contact_phone', e.target.value)}
                placeholder="+91 98765 43210" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>WhatsApp Number</label>
              <input style={inp()} type="tel" value={data.contact_whatsapp}
                onChange={e => set('contact_whatsapp', e.target.value)}
                placeholder="+91 98765 43210" onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div>
            <label style={lbl}>Reservation Email *</label>
            <input style={inp()} type="email" value={data.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              placeholder="reservations@yourproperty.com" onFocus={focus} onBlur={blur} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Property Website</label>
              <input style={inp()} value={data.contact_website}
                onChange={e => set('contact_website', e.target.value)}
                placeholder="https://www.property.com" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>GST Number</label>
              <input style={inp()} value={data.contact_gst}
                onChange={e => set('contact_gst', e.target.value)}
                placeholder="e.g. 27AAPFU0939F1ZV" onFocus={focus} onBlur={blur} />
            </div>
          </div>

          {/* ── Bank Details — optional, collapsed by default ─────────────── */}
          <div style={{
            border: `1.5px solid ${bankExpanded ? tokens.gold : tokens.border}`,
            borderRadius: tokens.radius.md, overflow: 'hidden', transition: 'border-color 0.15s',
          }}>
            <button type="button" onClick={() => setBankExpanded(e => !e)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px', border: 'none', cursor: 'pointer',
              background: bankExpanded ? tokens.goldLight : tokens.surface,
              textAlign: 'left', fontFamily: tokens.font.sans,
            }}>
              <span style={{ fontSize: 18 }}>🏦</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>
                  Bank Account Details
                  <span style={{ fontWeight: 400, color: tokens.text3, marginLeft: 8, fontSize: 11, textTransform: 'none' as const }}>(optional)</span>
                </div>
                <div style={{ fontSize: 11, color: tokens.text2 }}>
                  For partner payouts — separate from this property&apos;s partner KYC bank details
                </div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.text2} strokeWidth="2" strokeLinecap="round"
                style={{ transform: bankExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {bankExpanded && (
              <div style={{ padding: 16, borderTop: `1px solid ${tokens.border}` }}>
                <div style={{ padding: '10px 13px', background: tokens.amberLight, border: `1px solid ${tokens.amberBorder}`, borderRadius: tokens.radius.sm, fontSize: 12, color: tokens.amberText, marginBottom: 16, lineHeight: 1.5 }}>
                  💡 All fields here are optional. This is the property&apos;s own payout account — distinct from the partner-level bank details collected during KYC.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={lbl}>Account Holder Name</label>
                    <input style={inp()} value={bankDetails.account_holder_name}
                      onChange={e => setBank('account_holder_name', e.target.value)}
                      placeholder="As it appears on the bank account" onFocus={focus} onBlur={blur} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={lbl}>Account Number</label>
                      <input style={inp()} inputMode="numeric" value={bankDetails.account_number}
                        onChange={e => setBank('account_number', e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="e.g. 0123456789012" onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={lbl}>IFSC Code</label>
                      <input style={{ ...inp(), textTransform: 'uppercase' }} value={bankDetails.ifsc_code}
                        onChange={e => setBank('ifsc_code', e.target.value.toUpperCase().slice(0, 11))}
                        placeholder="e.g. HDFC0001234" maxLength={11} onFocus={focus} onBlur={blur} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={lbl}>Bank Name</label>
                      <input style={inp()} value={bankDetails.bank_name}
                        onChange={e => setBank('bank_name', e.target.value)}
                        placeholder="e.g. HDFC Bank" onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={lbl}>Branch Name</label>
                      <input style={inp()} value={bankDetails.branch_name}
                        onChange={e => setBank('branch_name', e.target.value)}
                        placeholder="e.g. Mall Road, Shimla" onFocus={focus} onBlur={blur} />
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: tokens.text3, margin: 0 }}>
                    🔒 Stored securely. Used only for partner payout processing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${tokens.border}` }} />

      {/* Nearby attractions */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Nearby attractions</div>
        <div style={{ fontSize: 12, color: tokens.text2, marginBottom: 16 }}>
          Shown on the property page under Experiences tab
        </div>

        {data.nearby_attractions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {data.nearby_attractions.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: tokens.white,
                border: `0.5px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: tokens.goldText,
                    background: tokens.goldLight, border: `1px solid ${tokens.goldBorder}`,
                    padding: '2px 8px', borderRadius: 9999,
                  }}>{a.distance_km} km</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: tokens.text }}>{a.name}</span>
                </div>
                <button type="button" onClick={() => removeAttraction(i)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tokens.text3, fontSize: 16, padding: '2px 6px',
                }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px auto', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={lbl}>Attraction Name</label>
            <input style={inp()} value={attrName}
              onChange={e => setAttrName(e.target.value)}
              placeholder="e.g. City Palace, Lake Pichola" onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Distance (km)</label>
            <input style={inp()} type="number" value={attrDist}
              onChange={e => setAttrDist(e.target.value)}
              placeholder="2.5" onFocus={focus} onBlur={blur} />
          </div>
          <button type="button" onClick={addAttraction} disabled={!attrName.trim() || !attrDist.trim()} style={{
            height: 41, padding: '0 18px', fontSize: 12, fontWeight: 700,
            border: `1px solid ${tokens.border}`, background: tokens.white,
            borderRadius: tokens.radius.sm, cursor: 'pointer',
            fontFamily: tokens.font.sans, color: tokens.text,
            opacity: !attrName.trim() || !attrDist.trim() ? 0.5 : 1,
          }}>
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}