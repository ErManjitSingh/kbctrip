'use client'
// src/app/cabs/new/page.tsx

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { tokens }           from '@/lib/tokens'
import { cabTypesApi }      from '@/lib/cabs-admin-store'
import { cabPricingApi }    from '@/lib/cabs-admin-store'
import Toast                from '@/components/uno-ui/Toast'
import AdminCabForm, { AdminCabFormData } from '@/components/cabs/AdminCabForm'

export default function NewAdminCabPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type?: 'success'|'error' }|null>(null)

  async function handleSubmit(data: AdminCabFormData) {
    setLoading(true)
    try {
      const cab = await cabTypesApi.create({
        name:               data.vehicle.name,
        cab_category:       data.vehicle.category,
        seating_capacity:   data.vehicle.seats,
        luggage_capacity:   data.vehicle.luggage_capacity,
        is_ac:              data.vehicle.ac,
        is_active:          false, // admin must explicitly activate
        is_featured:        data.vehicle.is_featured,
        features:           data.vehicle.features,
        service_types:      data.vehicle.service_types,
        fuel_type:          data.vehicle.fuel_type     || undefined,
        permit_type:        data.vehicle.permit_type   || undefined,
        // driver & vehicle
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
        base_price_per_day: null,
        price_type:         null,
      } as any)

      // Save website pricing if any rates entered
      const hasRates = Object.entries(data.pricing).some(([k, v]) => k.endsWith('_net') && Number(v) > 0)
      if (hasRates) await cabPricingApi.save(cab.id, data.pricing as any).catch(() => {})

      setToast({ message: `"${data.vehicle.name}" added — activate it from the list`, type: 'success' })
      setTimeout(() => router.push('/cabs'), 1400)
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Failed to create cab', type: 'error' })
    } finally { setLoading(false) }
  }

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
        <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>Add New Cab</span>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text }}>Add New Cab</div>
            <div style={{ fontSize: 12, color: tokens.text3, marginTop: 2 }}>
              Fill all steps. Cab starts as inactive — activate from the list after review.
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

        <AdminCabForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </>
  )
}