'use client'

/**
 * src/components/admin/wizard/WizardStep6.tsx
 *
 * Rooms editor — rebuilt to match the Ops frontend's rate-plan model
 * exactly (PropertyFormParts.tsx's RoomPanel). Every channel (Website,
 * Staff, Agent) carries its own full Room Rate AND Extra Bed rate plan,
 * each with four flat, independent EP/CP/MAP/AP numbers. "Same as…"
 * buttons let Admin one-time-copy another channel's rates as a starting
 * point for Staff/Agent, then adjust.
 */

import { useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { WizardData, RoomTypePayload, BedType } from './types'
import {
  RATE_PLAN_CODES, RATE_PLAN_CHANNELS, RATE_PLAN_SUBLABELS, RATE_PLAN_COPY_SOURCES,
  ROOM_TYPE_PRESETS,
  emptyChannelRatePlan, copyChannelRatePlan,
} from './types'
import type { RatePlanRates, RoomRatePlans } from './types'

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: 'single', label: 'Single' }, { value: 'double', label: 'Double' },
  { value: 'twin',   label: 'Twin'   }, { value: 'queen',  label: 'Queen'  },
  { value: 'king',   label: 'King'   }, { value: 'bunk',   label: 'Bunk'   },
]

const ROOM_AMENITIES = [
  'AC','TV','WiFi','Mini Bar','Safe','Balcony','Bathtub','Shower',
  'Hair Dryer','Room Service','Iron','Kettle','Sofa',
  'Sea View','Garden View','Pool View','City View',
]

const EMPTY_ROOM: RoomTypePayload = {
  name: '', description: '', bed_type: 'double',
  max_occupancy: 2, size_sqft: 0, count: 1,
  amenities: [], images: [],
  rate_plans: {
    website: emptyChannelRatePlan(),
    staff:   emptyChannelRatePlan(),
    agent:   emptyChannelRatePlan(),
  },
  weekend_markup_percent: 0,
  is_active: true,
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

export default function WizardStep6({ data, set }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editIdx,  setEditIdx]  = useState<number | null>(null)
  const [room,     setRoomState]= useState<RoomTypePayload>(EMPTY_ROOM)

  function setR<K extends keyof RoomTypePayload>(k: K, v: RoomTypePayload[K]) {
    setRoomState(r => ({ ...r, [k]: v }))
  }

  // Updates one cell of a channel's main ROOM rate row (Website/Staff/Agent × EP/CP/MAP/AP).
  function setRoomRate(channel: keyof RoomRatePlans, code: keyof RatePlanRates, value: number) {
    setRoomState(f => ({
      ...f,
      rate_plans: {
        ...f.rate_plans,
        [channel]: {
          ...f.rate_plans[channel],
          room: { ...f.rate_plans[channel].room, [code]: value },
        },
      },
    }))
  }

  // Updates one cell of a channel's EXTRA BED rate row (Website/Staff/Agent × EP/CP/MAP/AP).
  function setExtraBedRate(channel: keyof RoomRatePlans, code: keyof RatePlanRates, value: number) {
    setRoomState(f => ({
      ...f,
      rate_plans: {
        ...f.rate_plans,
        [channel]: {
          ...f.rate_plans[channel],
          extra_bed: { ...f.rate_plans[channel].extra_bed, [code]: value },
        },
      },
    }))
  }

  // "Same as…" button handler — one-time copy of a source channel's
  // rates into a target channel. Admin can still edit the target after.
  function copyChannelFrom(target: keyof RoomRatePlans, source: keyof RoomRatePlans) {
    setRoomState(f => ({
      ...f,
      rate_plans: { ...f.rate_plans, [target]: copyChannelRatePlan(f.rate_plans[source]) },
    }))
  }

  function toggleAmenity(a: string) {
    const cur = room.amenities
    setR('amenities', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a])
  }

  function openAdd() { setRoomState(EMPTY_ROOM); setEditIdx(null); setShowForm(true) }
  function openEdit(i: number) { setRoomState({ ...data.room_types[i] }); setEditIdx(i); setShowForm(true) }
  function cancel() { setShowForm(false); setEditIdx(null) }

  function saveRoom() {
    if (editIdx !== null) {
      const updated = [...data.room_types]; updated[editIdx] = room
      set('room_types', updated)
    } else {
      set('room_types', [...data.room_types, room])
    }
    setShowForm(false); setEditIdx(null)
  }

  const canSave = !!room.name.trim() && room.rate_plans.website.room.ep > 0 && room.count > 0

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = tokens.gold)
  const blurEv = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = tokens.border)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ padding: '12px 16px', borderRadius: tokens.radius.sm, fontSize: 13, background: tokens.amberLight, border: `1px solid ${tokens.amberBorder}`, color: tokens.amberText, lineHeight: 1.6 }}>
        Add at least <strong>1 room type</strong> to complete the listing. More can be added after publishing.
      </div>

      {/* Existing rooms */}
      {data.room_types.map((r, i) => {
        const webRoom = r.rate_plans.website.room
        const hasExtraBed = Object.values(r.rate_plans.website.extra_bed).some(v => v > 0)
          || Object.values(r.rate_plans.staff.extra_bed).some(v => v > 0)
          || Object.values(r.rate_plans.agent.extra_bed).some(v => v > 0)
        const otherPlans = [
          webRoom.cp  > 0 && 'CP',
          webRoom.map > 0 && 'MAP',
          webRoom.ap  > 0 && 'AP',
        ].filter(Boolean) as string[]

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px', background: tokens.white,
            border: `0.5px solid ${tokens.border}`, borderRadius: tokens.radius.md,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: tokens.text2, flexWrap: 'wrap' }}>
                <span>{r.bed_type} bed</span>
                <span>·</span><span>Max {r.max_occupancy} guests</span>
                {r.size_sqft > 0 && <><span>·</span><span>{r.size_sqft} sq ft</span></>}
                <span>·</span><span>{r.count} room{r.count > 1 ? 's' : ''}</span>
              </div>
              {/* Meal plan badges */}
              {otherPlans.length > 0 && (
                <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                  {otherPlans.map(code => (
                    <span key={code} style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: tokens.goldLight, border: `1px solid ${tokens.goldBorder}`,
                      color: tokens.goldText,
                    }}>
                      🍽️ {code} rate set
                    </span>
                  ))}
                </div>
              )}
              {otherPlans.length === 0 && (
                <span style={{ fontSize: 11, color: tokens.text3, marginTop: 6, display: 'inline-block' }}>EP only</span>
              )}
              {r.weekend_markup_percent > 0 && (
                <span style={{
                  display: 'inline-block', marginTop: 6, marginRight: 6, padding: '2px 8px',
                  borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: tokens.goldLight, border: `1px solid ${tokens.goldBorder}`,
                  color: tokens.goldText,
                }}>
                  📅 Weekend +{r.weekend_markup_percent}%
                </span>
              )}
              {hasExtraBed && (
                <span style={{
                  display: 'inline-block', marginTop: 6, padding: '2px 8px',
                  borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: tokens.blueLight, border: `1px solid ${tokens.blueBorder}`,
                  color: tokens.blueText,
                }}>
                  🛏️ Extra bed available
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>🌐 ₹{webRoom.ep.toLocaleString('en-IN')}</div>
                {r.rate_plans.staff.room.ep > 0 && <div style={{ fontSize: 11, color: tokens.blueText, fontWeight: 600 }}>👤 ₹{r.rate_plans.staff.room.ep.toLocaleString('en-IN')}</div>}
                {r.rate_plans.agent.room.ep > 0 && <div style={{ fontSize: 11, color: tokens.greenText, fontWeight: 600 }}>🤝 ₹{r.rate_plans.agent.room.ep.toLocaleString('en-IN')}</div>}
                <div style={{ fontSize: 10, color: tokens.text3 }}>EP / night</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => openEdit(i)} style={{
                  padding: '6px 13px', borderRadius: tokens.radius.sm, fontSize: 12,
                  border: `1px solid ${tokens.border}`, background: tokens.white,
                  cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.text,
                }}>Edit</button>
                <button type="button" onClick={() => set('room_types', data.room_types.filter((_, idx) => idx !== i))} style={{
                  padding: '6px 13px', borderRadius: tokens.radius.sm, fontSize: 12,
                  border: `1px solid ${tokens.redBorder}`, background: tokens.redLight,
                  cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.redText,
                }}>Remove</button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Room form */}
      {showForm ? (
        <div style={{
          border: `2px solid ${tokens.gold}`, borderRadius: tokens.radius.md,
          padding: '22px 24px', background: '#FFFDF7',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.goldText, marginBottom: 4 }}>
            {editIdx !== null ? 'Edit room type' : 'Add room type'}
          </div>

          {/* Room Name + Bed Type — same row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Room Name *</label>
              <input style={inp()} value={room.name} onChange={e => setR('name', e.target.value)} placeholder="e.g. Deluxe Lake View" onFocus={focus} onBlur={blurEv} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {ROOM_TYPE_PRESETS.map(preset => (
                  <button key={preset} type="button" onClick={() => setR('name', preset)} style={{
                    padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: tokens.font.sans,
                    border: `1px solid ${tokens.border}`, background: tokens.surface, color: tokens.text3,
                  }}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Bed Type *</label>
              <select style={{ ...inp(), height: 41, padding: '0 14px', cursor: 'pointer' }} value={room.bed_type} onChange={e => setR('bed_type', e.target.value as BedType)} onFocus={focus} onBlur={blurEv}>
                {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>

          {/* Max Occupancy, Size, Room Count — single row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Max Occupancy', key: 'max_occupancy' as const, placeholder: '2'   },
              { label: 'Size (sq ft)',  key: 'size_sqft'     as const, placeholder: '350' },
              { label: 'No. of Rooms *',key: 'count'         as const, placeholder: '5'   },
            ].map(({ label, key, placeholder }) => (
              <div key={String(key)}>
                <label style={lbl}>{label}</label>
                <input style={inp()} type="number" value={String(room[key] || '')} onChange={e => setR(key, Number(e.target.value))} placeholder={placeholder} onFocus={focus} onBlur={blurEv} />
              </div>
            ))}
          </div>

          {/* ── Rate Plans — one table per channel, Room + Extra Bed rows ── */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
              letterSpacing: '0.08em', color: tokens.orangeText,
              marginBottom: 4, paddingBottom: 8, borderBottom: `1px solid ${tokens.border}`,
            }}>
              Rate Plans ₹/night
            </div>
            <p style={{ fontSize: 11, color: tokens.text3, margin: '6px 0 14px' }}>
              Enter the direct rate for each meal plan, per channel. Use the
              &quot;Same as…&quot; buttons on Staff/Agent to copy rates over, then adjust.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {RATE_PLAN_CHANNELS.map(ch => {
                const copySources = RATE_PLAN_COPY_SOURCES[ch.key]
                return (
                  <div key={ch.key} style={{ border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.sm, overflow: 'hidden' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 14px', background: tokens.surface,
                      borderBottom: `1px solid ${tokens.border}`,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: tokens.text }}>
                        {ch.emoji} {ch.label}{ch.key === 'website' ? ' *' : ''}
                      </span>
                      {copySources.length > 0 && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {copySources.map(srcKey => {
                            const src = RATE_PLAN_CHANNELS.find(c => c.key === srcKey)!
                            return (
                              <button key={srcKey} type="button"
                                onClick={() => copyChannelFrom(ch.key, srcKey)}
                                style={{
                                  padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                                  cursor: 'pointer', border: `1px solid ${tokens.border}`,
                                  background: tokens.white, color: tokens.goldText, fontFamily: tokens.font.sans,
                                }}>
                                Same as {src.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Room rate row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 1fr 1fr 1fr', gap: 10, padding: '10px 14px', alignItems: 'center', borderBottom: `1px solid ${tokens.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text2 }}>Room Rate</div>
                      {RATE_PLAN_CODES.map(plan => (
                        <div key={plan.code}>
                          <div style={{ fontSize: 10, color: tokens.text3, marginBottom: 3 }}>{plan.label} <span style={{ fontWeight: 400 }}>· {RATE_PLAN_SUBLABELS[plan.code]}</span></div>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: tokens.text3, pointerEvents: 'none' }}>₹</span>
                            <input type="number" min={0}
                              value={room.rate_plans[ch.key].room[plan.code] || ''}
                              onChange={e => setRoomRate(ch.key, plan.code, Number(e.target.value) || 0)}
                              placeholder="0" style={{ ...inp(), padding: '7px 10px 7px 22px' }}
                              onFocus={focus} onBlur={blurEv} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Extra bed rate row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 1fr 1fr 1fr', gap: 10, padding: '10px 14px', alignItems: 'center', background: tokens.surface }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text2 }}>Extra Bed</div>
                      {RATE_PLAN_CODES.map(plan => (
                        <div key={plan.code}>
                          <div style={{ fontSize: 10, color: tokens.text3, marginBottom: 3 }}>{plan.label} <span style={{ fontWeight: 400 }}>· {RATE_PLAN_SUBLABELS[plan.code]}</span></div>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: tokens.text3, pointerEvents: 'none' }}>₹</span>
                            <input type="number" min={0}
                              value={room.rate_plans[ch.key].extra_bed[plan.code] || ''}
                              onChange={e => setExtraBedRate(ch.key, plan.code, Number(e.target.value) || 0)}
                              placeholder="0" style={{ ...inp(), padding: '7px 10px 7px 22px' }}
                              onFocus={focus} onBlur={blurEv} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Weekend markup — Website rates only */}
          <div>
            <label style={lbl}>Weekend Markup % <span style={{ textTransform: 'none' as const, fontWeight: 400, color: tokens.text3 }}>(Website only)</span></label>
            <input style={{ ...inp(), maxWidth: 200 }} type="number" min={0} max={500} step={0.5}
              value={room.weekend_markup_percent || ''}
              onChange={e => setR('weekend_markup_percent', Number(e.target.value) || 0)}
              placeholder="e.g. 15" onFocus={focus} onBlur={blurEv} />
            <p style={{ fontSize: 11, color: tokens.text3, marginTop: 4 }}>
              Applied on top of Website rates (room &amp; extra bed) on weekend nights. Staff &amp; Agent rates are unaffected.
            </p>
          </div>

          <div>
            <label style={lbl}>Room Description</label>
            <textarea style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }} rows={2} value={room.description} onChange={e => setR('description', e.target.value)} placeholder="Describe the room — view, highlights, unique features..." onFocus={focus} onBlur={blurEv} />
          </div>

          <div>
            <label style={{ ...lbl, marginBottom: 10 }}>Room Amenities ({room.amenities.length} selected)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {ROOM_AMENITIES.map(a => {
                const on = room.amenities.includes(a)
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                    padding: '5px 12px', borderRadius: 9999, fontSize: 12,
                    cursor: 'pointer', fontFamily: tokens.font.sans,
                    border: `1.5px solid ${on ? tokens.text : tokens.border}`,
                    background: on ? tokens.text : tokens.white,
                    color: on ? tokens.white : tokens.text2,
                    fontWeight: on ? 500 : 400, transition: 'all 0.12s',
                  }}>
                    {on && '✓ '}{a}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: `1px solid ${tokens.border}` }}>
            <button type="button" onClick={cancel} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.border}`, background: tokens.white, borderRadius: tokens.radius.sm, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.text }}>
              Cancel
            </button>
            <button type="button" onClick={saveRoom} disabled={!canSave} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.gold}`, background: tokens.gold, borderRadius: tokens.radius.sm, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: tokens.font.sans, color: tokens.white, opacity: canSave ? 1 : 0.5 }}>
              Save Room
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={openAdd} style={{
          alignSelf: 'flex-start', padding: '9px 20px', fontSize: 13, fontWeight: 700,
          border: `1.5px dashed ${tokens.border}`, background: tokens.surface,
          borderRadius: tokens.radius.md, cursor: 'pointer',
          fontFamily: tokens.font.sans, color: tokens.text2, transition: 'all 0.15s',
        }}>
          + Add Room Type
        </button>
      )}

      {data.room_types.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 24px', color: tokens.text3, fontSize: 13, border: `2px dashed ${tokens.border}`, borderRadius: tokens.radius.md }}>
          No room types yet — click &quot;Add Room Type&quot; to start.
        </div>
      )}
    </div>
  )
}