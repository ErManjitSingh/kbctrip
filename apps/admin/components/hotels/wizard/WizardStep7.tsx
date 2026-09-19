'use client'

import { useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { WizardData, DiningVenue } from './types'

const CUISINES = [
  'Multi-cuisine','Indian','North Indian','South Indian','Continental',
  'Chinese','Italian','Japanese','Mediterranean','Bar & Cocktails',
  'Café & Light Bites','Seafood','BBQ & Grill','Vegetarian','Vegan',
]

const EMPTY_VENUE: DiningVenue = {
  name: '', cuisine: 'Multi-cuisine', timing: '', description: '', open_to_public: false,
}

interface Props {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: tokens.text2,
  letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 7,
}

const inp = (): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', fontSize: 13,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm,
  fontFamily: tokens.font.sans, color: tokens.text, outline: 'none', boxSizing: 'border-box',
})

export default function WizardStep7({ data, set }: Props) {
  const [showForm, setShowForm]  = useState(false)
  const [editIdx,  setEditIdx]   = useState<number | null>(null)
  const [venue,    setVenueState]= useState<DiningVenue>(EMPTY_VENUE)

  function setV<K extends keyof DiningVenue>(k: K, v: DiningVenue[K]) {
    setVenueState(prev => ({ ...prev, [k]: v }))
  }

  function openAdd()       { setVenueState(EMPTY_VENUE); setEditIdx(null); setShowForm(true) }
  function openEdit(i: number) { setVenueState({ ...data.dining_venues[i] }); setEditIdx(i); setShowForm(true) }
  function cancel()        { setShowForm(false); setEditIdx(null) }

  function saveVenue() {
    if (editIdx !== null) {
      const updated = [...data.dining_venues]; updated[editIdx] = venue
      set('dining_venues', updated)
    } else {
      set('dining_venues', [...data.dining_venues, venue])
    }
    setShowForm(false); setEditIdx(null)
  }

  function deleteVenue(i: number) {
    set('dining_venues', data.dining_venues.filter((_, idx) => idx !== i))
  }

  const canSave = !!venue.name.trim() && !!venue.timing.trim()

  const focus  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = tokens.gold)
  const blurEv = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = tokens.border)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ padding: '12px 16px', borderRadius: tokens.radius.sm, fontSize: 13, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.text2, lineHeight: 1.6 }}>
        🍽️ <strong>Optional</strong> — skip if your property has no dining. Dining appears on a dedicated tab on the live property page.
      </div>

      {/* Existing venues */}
      {data.dining_venues.map((v, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', background: tokens.white,
          border: `0.5px solid ${tokens.border}`, borderRadius: tokens.radius.md,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>{v.name}</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: tokens.text2 }}>
              <span style={{ color: tokens.goldText, fontWeight: 600 }}>{v.cuisine}</span>
              <span>·</span><span>{v.timing}</span>
              {v.open_to_public && <><span>·</span><span style={{ color: tokens.greenText, fontWeight: 600 }}>Open to public</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => openEdit(i)} style={{ padding: '6px 13px', borderRadius: tokens.radius.sm, fontSize: 12, border: `1px solid ${tokens.border}`, background: tokens.white, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.text }}>Edit</button>
            <button type="button" onClick={() => deleteVenue(i)} style={{ padding: '6px 13px', borderRadius: tokens.radius.sm, fontSize: 12, border: `1px solid ${tokens.redBorder}`, background: tokens.redLight, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.redText }}>Remove</button>
          </div>
        </div>
      ))}

      {/* Venue form */}
      {showForm ? (
        <div style={{ border: `2px solid ${tokens.gold}`, borderRadius: tokens.radius.md, padding: '22px 24px', background: '#FFFDF7', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.goldText }}>{editIdx !== null ? 'Edit venue' : 'Add dining venue'}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Venue Name *</label>
              <input style={inp()} value={venue.name} onChange={e => setV('name', e.target.value)} placeholder="e.g. The Signature Restaurant" onFocus={focus} onBlur={blurEv} />
            </div>
            <div>
              <label style={lbl}>Cuisine Type *</label>
              <select style={{ ...inp(), height: 41, padding: '0 14px', cursor: 'pointer' }} value={venue.cuisine} onChange={e => setV('cuisine', e.target.value)} onFocus={focus} onBlur={blurEv}>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Operating Hours *</label>
            <input style={inp()} value={venue.timing} onChange={e => setV('timing', e.target.value)} placeholder="e.g. 7:00 AM – 11:00 PM" onFocus={focus} onBlur={blurEv} />
          </div>

          <div>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }} rows={2} value={venue.description} onChange={e => setV('description', e.target.value)} placeholder="Describe the dining experience, specialities, ambience..." onFocus={focus} onBlur={blurEv} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={venue.open_to_public} onChange={e => setV('open_to_public', e.target.checked)} style={{ width: 16, height: 16, accentColor: tokens.gold }} />
            <span style={{ fontSize: 13, color: tokens.text }}>Open to outside guests (non-residents)</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: `1px solid ${tokens.border}` }}>
            <button type="button" onClick={cancel} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.border}`, background: tokens.white, borderRadius: tokens.radius.sm, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.text }}>Cancel</button>
            <button type="button" onClick={saveVenue} disabled={!canSave} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.gold}`, background: tokens.gold, borderRadius: tokens.radius.sm, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: tokens.font.sans, color: tokens.white, opacity: canSave ? 1 : 0.5 }}>Save Venue</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={openAdd} style={{ alignSelf: 'flex-start', padding: '9px 20px', fontSize: 13, fontWeight: 700, border: `1.5px dashed ${tokens.border}`, background: tokens.surface, borderRadius: tokens.radius.md, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.text2 }}>
          + Add Dining Venue
        </button>
      )}

      {data.dining_venues.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 24px', color: tokens.text3, fontSize: 13, border: `2px dashed ${tokens.border}`, borderRadius: tokens.radius.md }}>
          No dining venues — skip this step if not applicable.
        </div>
      )}
    </div>
  )
}
