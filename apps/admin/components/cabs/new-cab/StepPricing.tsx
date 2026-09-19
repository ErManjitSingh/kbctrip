'use client'
// src/components/admin/cabs/new-cab/StepPricing.tsx

import { useState, ReactNode }  from 'react'
import { tokens }               from '@/lib/tokens'
import {
  FField, FInput, Grid, NumInput, SectionDivider,
  cardSt, sectionTitleSt,
  type NewCabFormState, type SeasonType, type SeasonDateRange,
} from './shared'

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0
function localId() { return `l${++_id}` }

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}
function isoLabel(iso: string) {
  const [y,m,d] = iso.split('-')
  return `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]} ${y}`
}
function getDays(y: number, m: number) { return new Date(y, m, 0).getDate() }
function getFirst(y: number, m: number) { return new Date(y, m-1, 1).getDay() }
function between(d: string, a: string, b: string) { return d >= a && d <= b }

// ─── Rate row ─────────────────────────────────────────────────────────────────

function RateRow({ label, note, net, margin, onNetChange, onMarginChange, isFlat = false }: {
  label: string; note?: string; net: number; margin: number; isFlat?: boolean
  onNetChange: (v: number) => void; onMarginChange: (v: number) => void
}) {
  const selling = +(net * (1 + margin / 100)).toFixed(2)
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.2fr 130px 120px 1fr',
      gap: '0 16px', alignItems: 'start',
      padding: '14px 0', borderBottom: `1px solid ${tokens.border}`,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: tokens.amber, marginTop: 3 }}>{note}</div>}
        <div style={{ fontSize: 11, color: tokens.text3, marginTop: 2 }}>{isFlat ? '₹/day' : '₹/km'}</div>
      </div>
      <div>
        <label style={{ display:'block', fontSize:10, fontWeight:700, color:tokens.text3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Net Rate</label>
        <NumInput value={net} onChange={onNetChange} />
      </div>
      <div>
        <label style={{ display:'block', fontSize:10, fontWeight:700, color:tokens.text3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Margin %</label>
        <NumInput value={margin} onChange={onMarginChange} prefix="%" />
      </div>
      <div style={{ paddingTop: 22 }}>
        <div style={{ fontSize:10, color:tokens.text3, marginBottom:2 }}>Package</div>
        <div style={{ fontWeight:700, fontSize:13, color:tokens.text2, fontFamily:tokens.font.mono }}>
          ₹{net.toFixed(2)}{isFlat?'/day':'/km'}
        </div>
        <div style={{ fontSize:10, color:tokens.text3, margin:'6px 0 2px' }}>Website</div>
        <div style={{ fontWeight:800, fontSize:14, color:tokens.green, fontFamily:tokens.font.mono }}>
          ₹{selling.toFixed(2)}{isFlat?'/day':'/km'}
        </div>
      </div>
    </div>
  )
}

// ─── Season calendar modal ────────────────────────────────────────────────────

function SeasonModal({ seasonType, existing, allRanges, onClose, onSave }: {
  seasonType: SeasonType
  existing:   SeasonDateRange[]
  allRanges:  SeasonDateRange[]
  onClose:    () => void
  onSave:     (r: SeasonDateRange[]) => void
}) {
  const now = new Date()
  const [y, setY]       = useState(now.getFullYear())
  const [m, setM]       = useState(now.getMonth()+1)
  const [ranges, setRanges]   = useState<SeasonDateRange[]>(existing)
  const [sel, setSel]         = useState(false)
  const [start, setStart]     = useState<string|null>(null)
  const [hover, setHover]     = useState<string|null>(null)
  const [pending, setPending] = useState<{from:string;to:string}|null>(null)
  const [rate, setRate]       = useState(0)
  const [label, setLabel]     = useState('')

  const isGreen = seasonType === 'in_season'
  const ac = isGreen ? tokens.green : tokens.blue
  const acL = isGreen ? tokens.greenLight : tokens.blueLight
  const acB = isGreen ? tokens.greenBorder : tokens.blueBorder
  const acT = isGreen ? tokens.greenText : tokens.blueText
  const others = allRanges.filter(r => r.season_type !== seasonType)

  function prev() { m===1?(setY(y-1),setM(12)):setM(m-1) }
  function next() { m===12?(setY(y+1),setM(1)):setM(m+1) }

  function click(iso: string) {
    if (!sel) { setSel(true); setStart(iso); setHover(iso) }
    else {
      const from = start!<=iso?start!:iso, to=start!<=iso?iso:start!
      setSel(false); setStart(null); setHover(null)
      setPending({from,to}); setRate(0); setLabel('')
    }
  }

  function confirm() {
    if (!pending||rate<=0) return
    setRanges(p => [...p, { id:localId(), season_type:seasonType, date_from:pending.from, date_to:pending.to, rate, label:label.trim() }])
    setPending(null)
  }

  function dayState(iso: string) {
    if (ranges.some(r=>between(iso,r.date_from,r.date_to))) return 'saved'
    if (pending && between(iso,pending.from,pending.to)) return 'pending'
    if (sel&&start&&hover) {
      const f=start<=hover?start:hover, t=start<=hover?hover:start
      if (between(iso,f,t)) return 'selecting'
    }
    if (others.some(r=>between(iso,r.date_from,r.date_to))) return 'other'
    return 'normal'
  }

  const days=getDays(y,m), first=getFirst(y,m)
  const [fr, setFr] = useState(false)

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{ background:tokens.white, borderRadius:tokens.radius.xl, padding:'28px 32px', width:600, maxWidth:'96vw', boxShadow:tokens.shadow.xl, maxHeight:'90vh', overflowY:'auto' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800 }}>{isGreen?'🟢 In-Season':'🔵 Off-Season'} Dates</div>
            <div style={{ fontSize:12, color:tokens.text3, marginTop:3 }}>Click start then end date to select a range</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, border:`1px solid ${tokens.border}`, background:tokens.white, borderRadius:tokens.radius.md, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        {/* Nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <button onClick={prev} style={{ width:32,height:32,border:`1px solid ${tokens.border}`,background:tokens.white,borderRadius:tokens.radius.md,cursor:'pointer',fontSize:15 }}>←</button>
          <span style={{ fontWeight:800, fontSize:15 }}>{MONTH_NAMES[m-1]} {y}</span>
          <button onClick={next} style={{ width:32,height:32,border:`1px solid ${tokens.border}`,background:tokens.white,borderRadius:tokens.radius.md,cursor:'pointer',fontSize:15 }}>→</button>
        </div>

        {/* Grid */}
        <div style={{ border:`1px solid ${tokens.border}`, borderRadius:tokens.radius.lg, overflow:'hidden', marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:tokens.surface }}>
            {DAY_NAMES.map(d=><div key={d} style={{ padding:'8px 0', textAlign:'center', fontSize:11, fontWeight:700, color:tokens.text3 }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {Array.from({length:first}).map((_,i)=>(
              <div key={`e${i}`} style={{ height:42, borderTop:`1px solid ${tokens.border}`, background:tokens.surface }} />
            ))}
            {Array.from({length:days}).map((_,i)=>{
              const day=i+1, iso=toIso(y,m,day), st=dayState(iso)
              const bg = st==='saved'?acL : st==='pending'?tokens.amberLight : st==='selecting'?tokens.orangeLight : st==='other'?'#F3F4F6' : tokens.white
              const tc = st==='saved'?acT : st==='pending'?tokens.amberText : st==='selecting'?tokens.orangeText : st==='other'?tokens.text3 : tokens.text
              return (
                <div key={day} onClick={()=>click(iso)} onMouseEnter={()=>sel&&setHover(iso)}
                  style={{ height:42, borderTop:`1px solid ${tokens.border}`, background:bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:st!=='normal'?700:400, color:tc, userSelect:'none' }}>
                  {day}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending */}
        {pending && (
          <div style={{ padding:'16px', marginBottom:16, background:tokens.amberLight, border:`1px solid ${tokens.amberBorder}`, borderRadius:tokens.radius.lg }}>
            <div style={{ fontSize:13, fontWeight:700, color:tokens.amberText, marginBottom:10 }}>
              Selected: {isoLabel(pending.from)} → {isoLabel(pending.to)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'0 12px', alignItems:'end' }}>
              <FField label="Rate (₹/day)" required>
                <input type="number" value={rate||''} onChange={e=>setRate(parseFloat(e.target.value)||0)}
                  placeholder="2500"
                  style={{ width:'100%', padding:'9px 12px', fontSize:13, border:`1px solid ${fr?tokens.orange:tokens.border}`, borderRadius:tokens.radius.md, outline:'none', fontFamily:tokens.font.mono, boxSizing:'border-box' as const }}
                  onFocus={()=>setFr(true)} onBlur={()=>setFr(false)} />
              </FField>
              <FField label="Label (optional)">
                <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Christmas peak"
                  style={{ width:'100%', padding:'9px 12px', fontSize:13, border:`1px solid ${tokens.border}`, borderRadius:tokens.radius.md, outline:'none', fontFamily:tokens.font.sans, boxSizing:'border-box' as const }} />
              </FField>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>setPending(null)} style={{ padding:'9px 12px', fontSize:12, fontWeight:600, border:`1px solid ${tokens.border}`, background:tokens.white, borderRadius:tokens.radius.md, cursor:'pointer', fontFamily:tokens.font.sans }}>Cancel</button>
                <button onClick={confirm} disabled={rate<=0} style={{ padding:'9px 14px', fontSize:12, fontWeight:700, border:'none', background:rate>0?tokens.orange:tokens.border, borderRadius:tokens.radius.md, cursor:rate>0?'pointer':'not-allowed', fontFamily:tokens.font.sans, color:rate>0?'#fff':tokens.text3 }}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Saved list */}
        {ranges.length>0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:tokens.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Saved ({ranges.length})</div>
            {ranges.map(r=>(
              <div key={r.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', marginBottom:6, background:acL, border:`1px solid ${acB}`, borderRadius:tokens.radius.md }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color:acT }}>{isoLabel(r.date_from)} → {isoLabel(r.date_to)}</span>
                  {r.label&&<span style={{ fontSize:11, color:tokens.text3, marginLeft:8 }}>{r.label}</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontWeight:800, fontSize:14, color:acT, fontFamily:tokens.font.mono }}>₹{r.rate.toLocaleString('en-IN')}/day</span>
                  <button onClick={()=>setRanges(p=>p.filter(x=>x.id!==r.id))} style={{ width:26,height:26,border:`1px solid ${tokens.redBorder}`,background:tokens.redLight,borderRadius:tokens.radius.sm,cursor:'pointer',fontSize:12,color:tokens.redText }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {ranges.length===0&&!pending&&(
          <div style={{ padding:'20px', textAlign:'center', color:tokens.text3, fontSize:13, border:`1.5px dashed ${tokens.border}`, borderRadius:tokens.radius.lg, marginBottom:16 }}>
            Click on the calendar to start selecting date ranges.
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'9px 18px', fontSize:13, fontWeight:600, border:`1px solid ${tokens.border}`, background:tokens.white, borderRadius:tokens.radius.md, cursor:'pointer', fontFamily:tokens.font.sans, color:tokens.text2 }}>Cancel</button>
          <button onClick={()=>onSave(ranges)} style={{ padding:'9px 22px', fontSize:13, fontWeight:800, border:'none', background:tokens.orange, color:'#fff', borderRadius:tokens.radius.md, cursor:'pointer', fontFamily:tokens.font.sans }}>
            Save {ranges.length} Range{ranges.length!==1?'s':''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Season card ──────────────────────────────────────────────────────────────

function SeasonCard({ type, ranges, allRanges, onEdit }: {
  type: SeasonType; ranges: SeasonDateRange[]; allRanges: SeasonDateRange[]; onEdit:()=>void
}) {
  const isGreen = type==='in_season'
  const ac  = isGreen?tokens.green:tokens.blue
  const acL = isGreen?tokens.greenLight:tokens.blueLight
  const acB = isGreen?tokens.greenBorder:tokens.blueBorder
  const acT = isGreen?tokens.greenText:tokens.blueText
  const avg = ranges.length>0 ? Math.round(ranges.reduce((s,r)=>s+r.rate,0)/ranges.length) : null

  return (
    <div onClick={onEdit} style={{ border:`1.5px solid ${ranges.length>0?acB:tokens.border}`, borderRadius:tokens.radius.lg, background:ranges.length>0?acL:tokens.surface, padding:'16px 18px', cursor:'pointer', transition:'all 0.12s' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ fontSize:14, fontWeight:800, color:ranges.length>0?acT:tokens.text }}>
          {isGreen?'🟢 In-Season':'🔵 Off-Season'} Dates
        </div>
        <div style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:tokens.radius.full, background:ranges.length>0?ac:tokens.border, color:ranges.length>0?'#fff':tokens.text3 }}>
          {ranges.length} range{ranges.length!==1?'s':''}
        </div>
      </div>
      <div style={{ fontSize:11, color:tokens.text3 }}>{isGreen?'Peak pricing dates':'Low season dates'}</div>
      {avg!==null && <div style={{ fontSize:12, fontWeight:600, color:acT, marginTop:6 }}>Avg: ₹{avg.toLocaleString('en-IN')}/day</div>}
      {ranges.slice(0,2).map(r=>(
        <div key={r.id} style={{ fontSize:11, color:acT, marginTop:3 }}>
          {r.date_from} → {r.date_to} — ₹{r.rate.toLocaleString('en-IN')}/day
        </div>
      ))}
      {ranges.length>2 && <div style={{ fontSize:11, color:tokens.text3, marginTop:2 }}>+{ranges.length-2} more…</div>}
      {ranges.length===0 && <div style={{ fontSize:12, color:tokens.text3, fontStyle:'italic', marginTop:4 }}>Click to add date ranges</div>}
    </div>
  )
}

// ─── Main step ────────────────────────────────────────────────────────────────

interface Props {
  form:     NewCabFormState
  errors:   Record<string, string>
  onChange: (patch: Partial<NewCabFormState>) => void
}

export default function StepPricing({ form, errors, onChange }: Props) {
  const [tab, setTab]       = useState<'package'|'website'>('package')
  const [modal, setModal]   = useState<SeasonType|null>(null)
  const allRanges           = [...form.inSeasonRanges, ...form.offSeasonRanges]

  return (
    <>
      {modal && (
        <SeasonModal
          seasonType={modal}
          existing={modal==='in_season'?form.inSeasonRanges:form.offSeasonRanges}
          allRanges={allRanges}
          onClose={()=>setModal(null)}
          onSave={ranges => {
            if (modal==='in_season') onChange({ inSeasonRanges: ranges })
            else onChange({ offSeasonRanges: ranges })
            setModal(null)
          }}
        />
      )}

      <div style={cardSt}>
        <h2 style={sectionTitleSt}>Pricing</h2>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:tokens.surface, borderRadius:tokens.radius.lg, padding:4, border:`1px solid ${tokens.border}` }}>
          {([
            { key:'package', icon:'📦', label:'Package Rates', sub:'Day rate for tour packages' },
            { key:'website', icon:'🌐', label:'Website Rates', sub:'Per-km rates for cab booking' },
          ] as const).map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ flex:1, padding:'10px 16px', cursor:'pointer', borderRadius:tokens.radius.md, border:'none', background:tab===t.key?tokens.white:'transparent', boxShadow:tab===t.key?tokens.shadow.sm:'none', fontFamily:tokens.font.sans, textAlign:'left', transition:'all 0.15s' }}>
              <div style={{ fontSize:13, fontWeight:700, color:tab===t.key?tokens.orange:tokens.text2 }}>{t.icon} {t.label}</div>
              <div style={{ fontSize:11, color:tokens.text3, marginTop:2 }}>{t.sub}</div>
            </button>
          ))}
        </div>

        {/* ── Package tab ── */}
        {tab==='package' && (
          <>
            <div style={{ padding:'12px 16px', marginBottom:20, background:tokens.blueLight, border:`1px solid ${tokens.blueBorder}`, borderRadius:tokens.radius.md, fontSize:12, color:tokens.blueText, lineHeight:1.6 }}>
              Package rates are used <strong>only inside Package Control</strong> when building tour itineraries.
            </div>
            <SectionDivider title="Standard Day Rate" />
            <div style={{ maxWidth:300, marginBottom:22 }}>
              <FField label="Rate (₹/day)" required error={errors.standard_day_rate} hint="Fallback for all dates not in season overrides">
                <NumInput value={form.standardDayRate} onChange={v=>onChange({standardDayRate:v})} />
              </FField>
            </div>
            <SectionDivider title="Season Date Overrides" />
            <p style={{ fontSize:12, color:tokens.text3, margin:'-8px 0 16px', lineHeight:1.6 }}>
              Click a card to open the calendar and set rates for specific date ranges.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
              <SeasonCard type="in_season"  ranges={form.inSeasonRanges}  allRanges={allRanges} onEdit={()=>setModal('in_season')} />
              <SeasonCard type="off_season" ranges={form.offSeasonRanges} allRanges={allRanges} onEdit={()=>setModal('off_season')} />
            </div>
            {form.standardDayRate>0 && (
              <div style={{ padding:'14px 18px', background:tokens.surface, borderRadius:tokens.radius.md, border:`1px solid ${tokens.border}`, fontSize:12, color:tokens.text2, lineHeight:1.8 }}>
                <strong>Active policy:</strong><br />
                🟢 In-season: {form.inSeasonRanges.length>0?`${form.inSeasonRanges.length} range(s) with custom rates`:'Standard rate applies'}<br />
                🔵 Off-season: {form.offSeasonRanges.length>0?`${form.offSeasonRanges.length} range(s) with custom rates`:'Standard rate applies'}<br />
                ⬜ All other dates: ₹{form.standardDayRate.toLocaleString('en-IN')}/day
              </div>
            )}
          </>
        )}

        {/* ── Website tab ── */}
        {tab==='website' && (
          <>
            <div style={{ padding:'12px 16px', marginBottom:20, background:tokens.blueLight, border:`1px solid ${tokens.blueBorder}`, borderRadius:tokens.radius.md, fontSize:12, color:tokens.blueText, lineHeight:1.6 }}>
              Net rate = what UNO pays the owner. Website rate = net + margin shown to guests.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1.2fr 130px 120px 1fr', gap:'0 16px', padding:'8px 0', fontSize:10, fontWeight:700, color:tokens.text3, textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:`2px solid ${tokens.border}` }}>
              <div>Trip Type</div><div>Net Rate</div><div>Margin %</div><div>Preview</div>
            </div>
            <RateRow label="One-Way Local" note="Under 75km — no return charge"
              net={form.onewayLocalNet} margin={form.onewayLocalMgn}
              onNetChange={v=>onChange({onewayLocalNet:v})} onMarginChange={v=>onChange({onewayLocalMgn:v})} />
            <RateRow label="One-Way Outstation" note="⚠ Billed as actual km × 2 (driver returns empty)"
              net={form.onewayOutNet} margin={form.onewayOutMgn}
              onNetChange={v=>onChange({onewayOutNet:v})} onMarginChange={v=>onChange({onewayOutMgn:v})} />
            <RateRow label="Round Trip"
              net={form.roundtripNet} margin={form.roundtripMgn}
              onNetChange={v=>onChange({roundtripNet:v})} onMarginChange={v=>onChange({roundtripMgn:v})} />
            <RateRow label={`Full Day (${form.fulldayKm}km / ${form.fulldayHrs}hrs)`}
              net={form.fulldayNet} margin={form.fulldayMgn} isFlat
              onNetChange={v=>onChange({fulldayNet:v})} onMarginChange={v=>onChange({fulldayMgn:v})} />

            <div style={{ marginTop:20 }}><SectionDivider title="Full Day Config" /></div>
            <Grid cols={4}>
              <FField label="Included KM"><NumInput value={form.fulldayKm} onChange={v=>onChange({fulldayKm:v})} prefix="" /></FField>
              <FField label="Included Hrs"><NumInput value={form.fulldayHrs} onChange={v=>onChange({fulldayHrs:v})} prefix="" /></FField>
              <FField label="Extra KM Net"><NumInput value={form.extraKmNet} onChange={v=>onChange({extraKmNet:v})} /></FField>
              <FField label="Extra HR Net"><NumInput value={form.extraHrNet} onChange={v=>onChange({extraHrNet:v})} /></FField>
            </Grid>

            <div style={{ marginTop:20 }}><SectionDivider title="Add-Ons" /></div>
            <Grid cols={3}>
              <FField label="Off-Season Multiplier" hint="0.85 = 15% cheaper"><NumInput value={form.offMult} onChange={v=>onChange({offMult:v})} prefix="×" /></FField>
              <FField label="Driver Allowance/Night" hint="Outstation > 200km"><NumInput value={form.driverAllowance} onChange={v=>onChange({driverAllowance:v})} /></FField>
              <FField label="Night Charge" hint="10PM–6AM pickups"><NumInput value={form.nightCharge} onChange={v=>onChange({nightCharge:v})} /></FField>
            </Grid>
          </>
        )}
      </div>
    </>
  )
}