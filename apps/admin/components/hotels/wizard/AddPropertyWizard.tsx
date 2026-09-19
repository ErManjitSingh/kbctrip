'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { tokens } from '@/lib/tokens'
import { EMPTY_WIZARD, STEPS, type WizardData } from './types'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'
import WizardStep3 from './WizardStep3'
import WizardStep4 from './WizardStep4'
import WizardStep5 from './WizardStep5'
import WizardStep6 from './WizardStep6'
import WizardStep7 from './WizardStep7'
import WizardStep8 from './WizardStep8'
import WizardLayout from './WizardLayout'
import Toast from '@/components/uno-ui/Toast'
import { adminPropertiesApi } from '@/lib/hotels-wizard-api'

function validate(step: number, data: WizardData): string | null {
  if (step === 1) {
    if (!data.name.trim())        return 'Property name is required.'
    if (!data.description.trim()) return 'Description is required.'
    if (!data.total_rooms)        return 'Total rooms is required.'
    if (!data.partner_id.trim())  return 'Partner ID is required.'
  }
  if (step === 2) {
    if (!data.address.trim()) return 'Street address is required.'
    if (!data.city.trim())    return 'City is required.'
    if (!data.state.trim())   return 'State is required.'
  }
  if (step === 5) {
    if (!data.contact_phone.trim()) return 'Property phone is required.'
    if (!data.contact_email.trim()) return 'Reservation email is required.'
  }
  if (step === 6) {
    if (data.room_types.length === 0) return 'Add at least one room type.'
  }
  return null
}

export default function AddPropertyWizard() {
  const router = useRouter()
  const [step,       setStep]   = useState(1)
  const [data,       setData]   = useState<WizardData>(EMPTY_WIZARD)
  const [submitting, setSub]    = useState(false)
  const [done,       setDone]   = useState(false)
  const [created,    setCreated] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [toast,      setToast]  = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const dismiss = useCallback(() => setToast(null), [])

  function set<K extends keyof WizardData>(k: K, v: WizardData[K]) {
    setData(prev => ({ ...prev, [k]: v }))
  }

  function goNext() {
    const err = validate(step, data)
    if (err) { setToast({ msg: err, type: 'error' }); return }
    if (step < 8) setStep(s => s + 1)
  }

  function goBack() {
    if (step > 1) setStep(s => s - 1)
  }

  async function submit() {
    const err = validate(step, data)
    if (err) { setToast({ msg: err, type: 'error' }); return }

    // All 4 agreements must be checked before submitting
    const { terms_accepted, cancellation_accepted, payment_accepted, legal_accepted } = data.agreements
    if (!terms_accepted || !cancellation_accepted || !payment_accepted || !legal_accepted) {
      setToast({ msg: 'Please read and accept all 4 partner agreements in Section C before submitting.', type: 'error' })
      return
    }

    setSub(true)
    try {
      // Build payload matching backend PropertyWizardData schema
      const payload = {
        // Step 1
        name:            data.name,
        property_type:   data.property_type,
        star_category:   data.star_category,
        description:     data.description,
        total_rooms:     data.total_rooms,
        collection_type: data.collection_type,
        partner_id:      data.partner_id,

        // Step 2
        address:   data.address,
        city:      data.city,
        state:     data.state,
        pincode:   data.pincode,
        landmark:  data.landmark,

        // Step 3
        amenities: data.amenities,
        tags:      data.tags,

        // Step 4
        check_in_time:   data.check_in_time,
        check_out_time:  data.check_out_time,
        cancellation:    data.cancellation,
        children:        data.children,
        pets:            data.pets,
        smoking:         data.smoking,
        extra_bed:       data.extra_bed,
        early_check_in:  data.early_check_in,
        late_check_out:  data.late_check_out,
        age_restriction: data.age_restriction,
        alcohol:         data.alcohol,
        payment_methods: data.payment_methods,

        // Step 5 — contact wrapped in object as backend expects
        contact: {
          phone:    data.contact_phone,
          email:    data.contact_email,
          whatsapp: data.contact_whatsapp,
          website:  data.contact_website,
          gst:      data.contact_gst,
        },
        nearby_attractions: data.nearby_attractions,
        // Optional — null when no payout details were entered for this property.
        bank_details: data.bank_details,

        // Step 6
        room_types: data.room_types,

        // Step 7
        dining_venues: data.dining_venues,

        // Step 8
        photo_categories: data.photo_categories,

        // Admin override — always approved, skip review queue
        status: 'approved',
      }

      const result = await adminPropertiesApi.createProperty(payload)
      setCreated(result)
      setDone(true)
    } catch (e: any) {
      setToast({ msg: e.message ?? 'Failed to create property. Please try again.', type: 'error' })
    } finally {
      setSub(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done && created) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: tokens.text, margin: '0 0 12px' }}>
          Property published!
        </h2>
        <p style={{ fontSize: 14, color: tokens.text2, lineHeight: 1.7, margin: '0 0 28px' }}>
          <strong style={{ color: tokens.text }}>{created.name}</strong> has been created with status{' '}
          <strong style={{ color: tokens.greenText }}>Approved</strong> and is now live on the KBC Trip Hotels platform.
        </p>
        <div style={{
          padding: '16px 20px', background: tokens.greenLight,
          border: `1px solid ${tokens.greenBorder}`, borderRadius: tokens.radius.md,
          fontSize: 13, color: tokens.greenText, marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>What was created:</div>
          <div>📍 {data.name} — {data.city}, {data.state}</div>
          <div>🛏️ {data.room_types.length} room type{data.room_types.length !== 1 ? 's' : ''} · {data.total_rooms} total rooms</div>
          <div>🏷️ {data.collection_type.replace(/_/g, ' ')} · {'★'.repeat(data.star_category)}</div>
          {data.dining_venues.length > 0 && <div>🍽️ {data.dining_venues.length} dining venue{data.dining_venues.length !== 1 ? 's' : ''}</div>}
          {data.photo_categories.length > 0 && (
            <div>📷 {data.photo_categories.reduce((s, c) => s + c.images.length, 0)} photos across {data.photo_categories.length} categories</div>
          )}
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>ID: {created.id}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => { setData(EMPTY_WIZARD); setStep(1); setDone(false); setCreated(null) }}
            style={{ padding: '11px 24px', fontSize: 13, fontWeight: 700, border: `1px solid ${tokens.border}`, background: tokens.white, borderRadius: tokens.radius.md, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.text }}
          >
            Add Another Property
          </button>
          <button
            onClick={() => router.push('/hotels')}
            style={{ padding: '11px 24px', fontSize: 13, fontWeight: 700, border: `1px solid ${tokens.gold}`, background: tokens.gold, borderRadius: tokens.radius.md, cursor: 'pointer', fontFamily: tokens.font.sans, color: tokens.white }}
          >
            View All Properties →
          </button>
        </div>
      </div>
    )
  }

  const STEP_COMPONENTS = [
    <WizardStep1 key={1} data={data} set={set} />,
    <WizardStep2 key={2} data={data} set={set} />,
    <WizardStep3 key={3} data={data} set={set} />,
    <WizardStep4 key={4} data={data} set={set} />,
    <WizardStep5 key={5} data={data} set={set} />,
    <WizardStep6 key={6} data={data} set={set} />,
    <WizardStep7 key={7} data={data} set={set} />,
    <WizardStep8 key={8} data={data} set={set} />,
  ]

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button type="button" onClick={goBack} disabled={step === 1} style={{
        padding: '10px 24px', fontSize: 13, fontWeight: 700,
        border: `1px solid ${tokens.border}`, background: tokens.white,
        borderRadius: tokens.radius.md, cursor: step === 1 ? 'not-allowed' : 'pointer',
        fontFamily: tokens.font.sans, color: tokens.text,
        opacity: step === 1 ? 0.4 : 1, transition: 'opacity 0.15s',
      }}>
        ← Back
      </button>

      <span style={{ fontSize: 12, color: tokens.text2 }}>
        {step < 8 ? `${8 - step} step${8 - step !== 1 ? 's' : ''} remaining` : 'Final step — ready to publish'}
      </span>

      {step < 8 ? (
        <button type="button" onClick={goNext} style={{
          padding: '10px 28px', fontSize: 13, fontWeight: 700,
          border: `1px solid ${tokens.gold}`, background: tokens.gold,
          borderRadius: tokens.radius.md, cursor: 'pointer',
          fontFamily: tokens.font.sans, color: tokens.white,
        }}>
          Next →
        </button>
      ) : (
        <button type="button" onClick={submit} disabled={submitting} style={{
          padding: '10px 28px', fontSize: 13, fontWeight: 700,
          border: `1px solid ${tokens.green}`, background: tokens.green,
          borderRadius: tokens.radius.md, cursor: submitting ? 'not-allowed' : 'pointer',
          fontFamily: tokens.font.sans, color: tokens.white,
          opacity: submitting ? 0.7 : 1,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {submitting ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Publishing…
            </>
          ) : '✓ Publish Property'}
        </button>
      )}
    </div>
  )

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={dismiss} />}
      <WizardLayout
        steps={STEPS}
        currentStep={step}
        onStepClick={setStep}
        header={{
          stepLabel: `Step ${step} of ${STEPS.length}`,
          title: STEPS[step - 1].label,
          badge: data.name && step > 1 ? `${data.name} · ${data.city || '—'}` : undefined,
        }}
        footer={footer}
      >
        {STEP_COMPONENTS[step - 1]}
      </WizardLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}