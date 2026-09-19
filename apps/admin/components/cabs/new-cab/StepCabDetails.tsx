'use client'
// src/components/admin/cabs/new-cab/StepCabDetails.tsx

import { tokens }                from '@/lib/tokens'
import type { CabOwnerDropdownItem } from '@/types/cabV2'
import {
  FField, FInput, FTextarea, Grid, Toggle, SectionDivider,
  CAB_CATEGORY_SUGGESTIONS, inputBase, cardSt, sectionTitleSt,
  type NewCabFormState,
} from './shared'

interface Props {
  form:      NewCabFormState
  owners:    CabOwnerDropdownItem[]
  errors:    Record<string, string>
  onChange:  (patch: Partial<NewCabFormState>) => void
  clearError:(key: string) => void
}

export default function StepCabDetails({ form, owners, errors, onChange, clearError }: Props) {
  return (
    <div style={cardSt}>
      <h2 style={sectionTitleSt}>Cab Details</h2>

      {/* ── Basic Info ── */}
      <SectionDivider title="Basic Info" />
      <Grid cols={2}>
        <FField label="Cab Name" required error={errors.name}>
          <FInput
            value={form.name}
            onChange={v => { onChange({ name: v }); clearError('name') }}
            placeholder="e.g. Toyota Innova Crysta"
            error={!!errors.name}
          />
        </FField>
        <FField label="Slug" required error={errors.slug}
          hint="Auto-generated from name. Edit to customise URL.">
          <FInput
            value={form.slug}
            onChange={v => { onChange({ slug: v, slugEdited: true }); clearError('slug') }}
            placeholder="toyota-innova-crysta"
            mono error={!!errors.slug}
          />
        </FField>
      </Grid>
      <div style={{ marginTop: 14 }}>
        <FField label="Short Description"
          hint="Brief 1-2 line teaser shown on cab cards. Max 500 chars.">
          <FTextarea
            value={form.shortDesc}
            onChange={v => onChange({ shortDesc: v })}
            placeholder="Comfortable 7-seater SUV ideal for family trips and long drives…"
            rows={2}
          />
        </FField>
      </div>

      {/* ── Owner ── */}
      <SectionDivider title="Owner" />
      <div style={{ maxWidth: 480 }}>
        <FField label="Assign Owner" required error={errors.owner_id}
          hint="Select the fleet vendor who owns this cab">
          <select
            value={form.ownerId}
            onChange={e => { onChange({ ownerId: e.target.value }); clearError('owner_id') }}
            style={{
              ...inputBase,
              cursor: 'pointer',
              borderColor: errors.owner_id ? tokens.red : tokens.border,
            }}
          >
            <option value="">— Select owner —</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>
                {o.owner_name}{o.business_name ? ` (${o.business_name})` : ''} · {o.city}
              </option>
            ))}
          </select>
          {owners.length === 0 && (
            <p style={{ fontSize: 11, color: tokens.amber, marginTop: 5 }}>
              No owners found.{' '}
              <a href="/admin/cabs/owners/new" target="_blank"
                style={{ color: tokens.orange, fontWeight: 700 }}>
                Add an owner first →
              </a>
            </p>
          )}
        </FField>
      </div>

      {/* ── Category & Status ── */}
      <SectionDivider title="Cab & Category" />
      <Grid cols={2}>
        <FField label="Cab Category" required error={errors.cab_category}
          hint="Type your own or click a suggestion">
          <FInput
            value={form.cabCategory}
            onChange={v => { onChange({ cabCategory: v }); clearError('cab_category') }}
            placeholder="e.g. SUV, Sedan, Tempo Traveller…"
            error={!!errors.cab_category}
          />
          {/* Suggestion pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {CAB_CATEGORY_SUGGESTIONS.map(s => (
              <button key={s} type="button"
                onClick={() => { onChange({ cabCategory: s }); clearError('cab_category') }}
                style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 600,
                  borderRadius: tokens.radius.full, cursor: 'pointer',
                  border: `1px solid ${form.cabCategory === s ? tokens.orangeBorder : tokens.border}`,
                  background: form.cabCategory === s ? tokens.orangeLight : tokens.surface,
                  color: form.cabCategory === s ? tokens.orangeText : tokens.text3,
                  fontFamily: tokens.font.sans,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </FField>

        <FField label="Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
            <Toggle label="Active" checked={form.isActive} onChange={v => onChange({ isActive: v })}
              hint="Active cabs appear in the package itinerary dropdown" />
            <Toggle label="Featured" checked={form.isFeatured} onChange={v => onChange({ isFeatured: v })}
              hint="Highlighted in the cab catalog" />
          </div>
        </FField>
      </Grid>
    </div>
  )
}