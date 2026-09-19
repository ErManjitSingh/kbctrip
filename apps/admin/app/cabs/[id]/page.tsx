'use client'
// src/app/cabs/[id]/page.tsx
// Edit cab — full CabForm + SEO tab (admin-only)

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { tokens }              from '@/lib/tokens'
import { cabTypesApi }         from '@/lib/cabs-admin-store'
import { cabPricingApi }       from '@/lib/cabs-admin-store'
import Toast                   from '@/components/uno-ui/Toast'
import AdminCabForm, { AdminCabFormData } from '@/components/cabs/AdminCabForm'
import type { AdminCab }        from '@/lib/cabs-admin-store'

// ── SEO Section ───────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', fontSize: 13,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.md,
  outline: 'none', color: tokens.text, background: tokens.white,
  fontFamily: tokens.font.sans, boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

function SeoSection({ slug, seoTitle, seoDesc, seoKeywords, onChange }: {
  slug:        string
  seoTitle:    string
  seoDesc:     string
  seoKeywords: string
  onChange:    (field: string, val: string) => void
}) {
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: tokens.text2,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
  }
  const hint: React.CSSProperties = { fontSize: 11, color: tokens.text3, marginTop: 4 }
  const card: React.CSSProperties = {
    background: tokens.white, border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius.lg, padding: '22px 26px', marginBottom: 16,
    boxShadow: tokens.shadow.sm,
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: 800, color: tokens.text,
    marginBottom: 18, paddingBottom: 10, borderBottom: `1px solid ${tokens.border}`,
  }
  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }

  return (
    <>
      {/* Slug */}
      <div style={card}>
        <div style={sectionTitle}>URL & Slug</div>
        <div>
          <label style={lbl}>Slug</label>
          <input
            value={slug}
            onChange={e => onChange('slug', e.target.value)}
            placeholder="toyota-innova-crysta"
            style={{ ...inp, fontFamily: tokens.font.mono }}
            onFocus={e => (e.currentTarget.style.borderColor = tokens.orange)}
            onBlur={e  => (e.currentTarget.style.borderColor = tokens.border)}
          />
          <p style={{ ...hint, color: tokens.amberText }}>
            ⚠ Changing slug breaks existing URLs and SEO — do with caution
          </p>
        </div>

        {/* Sitemap preview */}
        <div style={{
          marginTop: 14, padding: '12px 16px', background: '#F0F4FF',
          borderRadius: tokens.radius.md, border: `1px solid ${tokens.blueBorder}`,
          fontFamily: tokens.font.mono, fontSize: 12, color: tokens.blueText,
          lineHeight: 1.7, wordBreak: 'break-all',
        }}>
          {`https://unotrips.com/cabs/${slug || '<auto-slug>'}`}
        </div>
      </div>

      {/* Meta tags */}
      <div style={card}>
        <div style={sectionTitle}>SEO Meta Tags</div>
        <div style={g2}>
          <div>
            <label style={lbl}>SEO Title</label>
            <input
              value={seoTitle}
              onChange={e => onChange('seoTitle', e.target.value)}
              placeholder="Best SUV Cab Hire — Toyota Innova Crysta"
              style={inp}
              onFocus={e => (e.currentTarget.style.borderColor = tokens.orange)}
              onBlur={e  => (e.currentTarget.style.borderColor = tokens.border)}
            />
            <p style={{ ...hint, color: seoTitle.length > 60 ? tokens.red : tokens.text3 }}>
              {seoTitle.length}/60 chars recommended
            </p>
          </div>
          <div>
            <label style={lbl}>SEO Keywords</label>
            <input
              value={seoKeywords}
              onChange={e => onChange('seoKeywords', e.target.value)}
              placeholder="innova crysta, suv cab hire, 7 seater…"
              style={inp}
              onFocus={e => (e.currentTarget.style.borderColor = tokens.orange)}
              onBlur={e  => (e.currentTarget.style.borderColor = tokens.border)}
            />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={lbl}>SEO Meta Description</label>
          <textarea
            value={seoDesc}
            onChange={e => onChange('seoDesc', e.target.value)}
            placeholder="Hire a spacious Toyota Innova Crysta with professional driver…"
            rows={3}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
            onFocus={e => (e.currentTarget.style.borderColor = tokens.orange)}
            onBlur={e  => (e.currentTarget.style.borderColor = tokens.border)}
          />
          <p style={{ ...hint, textAlign: 'right', color: seoDesc.length > 160 ? tokens.red : tokens.text3 }}>
            {seoDesc.length}/160 chars recommended
          </p>
        </div>
      </div>
    </>
  )
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'details', label: 'Cab Details' },
  { id: 'seo',     label: 'SEO'         },
] as const

type Tab = typeof TABS[number]['id']

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EditAdminCabPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id     = params.id

  const [cab,      setCab]      = useState<AdminCab | null>(null)
  const [pricing,  setPricing]  = useState<any | null>(null)
  const [fetching, setFetching] = useState(true)
  const [loading,  setLoading]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [toast,    setToast]    = useState<{ message: string; type?: 'success'|'error' }|null>(null)

  // SEO state
  const [slug,        setSlug]        = useState('')
  const [seoTitle,    setSeoTitle]    = useState('')
  const [seoDesc,     setSeoDesc]     = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [seoSaving,   setSeoSaving]   = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [cabData, pricingData] = await Promise.allSettled([
          cabTypesApi.get(id),
          cabPricingApi.get(id),
        ])
        if (cabData.status === 'fulfilled') {
          const c = cabData.value as any
          setCab(cabData.value)
          setSlug(c.slug        ?? '')
          setSeoTitle(c.seo_title       ?? '')
          setSeoDesc(c.seo_description  ?? '')
          setSeoKeywords(c.seo_keywords ?? '')
        } else {
          setToast({ message: 'Cab not found', type: 'error' })
        }
        if (pricingData.status === 'fulfilled') setPricing(pricingData.value)
      } finally { setFetching(false) }
    }
    load()
  }, [id])

  // ── Cab details save (from AdminCabForm) ──────────────────────────────────

  async function handleDetailsSubmit(data: AdminCabFormData) {
    setLoading(true)
    try {
      await cabTypesApi.update(id, {
        name:               data.vehicle.name,
        cab_category:       data.vehicle.category,
        seating_capacity:   data.vehicle.seats,
        luggage_capacity:   data.vehicle.luggage_capacity,
        is_ac:              data.vehicle.ac,
        is_featured:        data.vehicle.is_featured,
        features:           data.vehicle.features,
        service_types:      data.vehicle.service_types,
        fuel_type:          data.vehicle.fuel_type     || undefined,
        permit_type:        data.vehicle.permit_type   || undefined,
        driver_name:        data.ownerDriver.driver_name     || undefined,
        driver_phone:       data.ownerDriver.driver_phone    || undefined,
        driver_whatsapp:    data.ownerDriver.driver_whatsapp || undefined,
        driver_license:     data.ownerDriver.driver_license  || undefined,
        driver_pan:         data.ownerDriver.driver_pan      || undefined,
        owner_name:         data.ownerDriver.owner_name      || undefined,
        owner_phone:        data.ownerDriver.owner_phone     || undefined,
        owner_email:        data.ownerDriver.owner_email     || undefined,
        registration_number: data.vehicle.registration_number || undefined,
        vehicle_model:      data.vehicle.vehicle_model       || undefined,
        vehicle_color:      data.vehicle.vehicle_color       || undefined,
        vehicle_year:       data.vehicle.vehicle_year        || undefined,
        base_city:          data.vehicle.base_city           || undefined,
        vehicle_notes:      data.vehicle.vehicle_notes       || undefined,
        featured_image:     data.photos.featured_image       || undefined,
        gallery_images:     data.photos.gallery_images,
      } as any)

      const hasRates = Object.entries(data.pricing).some(([k, v]) => k.endsWith('_net') && Number(v) > 0)
      if (hasRates) await cabPricingApi.save(id, data.pricing as any).catch(() => {})

      setToast({ message: 'Cab updated ✓', type: 'success' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Update failed', type: 'error' })
    } finally { setLoading(false) }
  }

  // ── SEO save ──────────────────────────────────────────────────────────────

  async function handleSeoSave() {
    setSeoSaving(true)
    try {
      await cabTypesApi.update(id, {
        slug:            slug.trim()       || undefined,
        seo_title:       seoTitle.trim()   || null,
        seo_description: seoDesc.trim()    || null,
        seo_keywords:    seoKeywords.trim() || null,
      } as any)
      setToast({ message: 'SEO saved ✓', type: 'success' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setToast({ message: err?.message ?? 'SEO save failed', type: 'error' })
    } finally { setSeoSaving(false) }
  }

  // ── Tab bar styles ────────────────────────────────────────────────────────

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', fontSize: 12, fontWeight: 700,
    borderRadius: tokens.radius.md, cursor: 'pointer', border: 'none',
    fontFamily: tokens.font.sans, whiteSpace: 'nowrap',
    background: active ? tokens.orange : 'transparent',
    color: active ? '#fff' : tokens.text2,
    transition: 'all 0.15s',
  })

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type ?? 'success'} onDismiss={() => setToast(null)} />}

      {/* Topbar */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 28px', borderBottom: `1px solid ${tokens.border}`,
        background: tokens.white, flexShrink: 0,
      }}>
        <span
          style={{ fontSize: 12, color: tokens.orange, cursor: 'pointer', fontWeight: 600 }}
          onClick={() => router.push('/cabs')}
        >
          Cabs
        </span>
        <span style={{ color: tokens.border }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>Edit Cab</span>
        {saved && (
          <span style={{
            marginLeft: 8, padding: '3px 10px', borderRadius: tokens.radius.full,
            background: tokens.greenLight, border: `1px solid ${tokens.greenBorder}`,
            fontSize: 11, fontWeight: 700, color: tokens.greenText,
          }}>
            ✓ Saved
          </span>
        )}
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text }}>
              {cab?.name || 'Edit Cab'}
            </div>
            <div style={{ fontSize: 12, color: tokens.text3, marginTop: 2 }}>
              {cab ? `${CATEGORY_LABELS[(cab as any).cab_category] || (cab as any).cab_category} · ${(cab as any).seating_capacity} seats · ${(cab as any).is_active ? 'Active' : 'Pending'}` : 'Loading…'}
            </div>
          </div>
          <button
            onClick={() => router.push('/cabs')}
            style={{
              padding: '8px 16px', fontSize: 12, fontWeight: 600,
              border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.md,
              background: tokens.white, color: tokens.text2, cursor: 'pointer',
              fontFamily: tokens.font.sans,
            }}
          >
            ← Back
          </button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: tokens.white, border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius.lg, padding: 5, boxShadow: tokens.shadow.sm,
          width: 'fit-content',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabBtn(activeTab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 80, color: tokens.text3 }}>Loading…</div>
        ) : !cab ? (
          <div style={{
            padding: '16px 20px', borderRadius: tokens.radius.md,
            background: tokens.redLight, border: `1px solid ${tokens.redBorder}`,
            color: tokens.redText, fontSize: 13,
          }}>
            Cab not found.
          </div>
        ) : (
          <>
            {activeTab === 'details' && (
              <AdminCabForm
                initial={cab as any}
                initialPricing={pricing}
                onSubmit={handleDetailsSubmit}
                loading={loading}
                isEdit
              />
            )}

            {activeTab === 'seo' && (
              <>
                <SeoSection
                  slug={slug}
                  seoTitle={seoTitle}
                  seoDesc={seoDesc}
                  seoKeywords={seoKeywords}
                  onChange={(field, val) => {
                    if (field === 'slug')        setSlug(val)
                    if (field === 'seoTitle')    setSeoTitle(val)
                    if (field === 'seoDesc')     setSeoDesc(val)
                    if (field === 'seoKeywords') setSeoKeywords(val)
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={handleSeoSave}
                    disabled={seoSaving}
                    style={{
                      padding: '10px 24px', fontSize: 13, fontWeight: 800,
                      borderRadius: tokens.radius.md, border: 'none',
                      background: seoSaving ? tokens.border : tokens.orange,
                      color: seoSaving ? tokens.text3 : '#fff',
                      cursor: seoSaving ? 'not-allowed' : 'pointer',
                      fontFamily: tokens.font.sans,
                    }}
                  >
                    {seoSaving ? 'Saving…' : '✓ Save SEO'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  sedan: 'Sedan', suv: 'SUV', muv: 'MUV',
  tempo_traveller: 'Tempo Traveller', mini_bus: 'Mini Bus', luxury: 'Luxury',
}