'use client'
// src/components/admin/cabs/new-cab/StepSpecs.tsx

import {
  FField, FInput, FSelect, Grid, Toggle, Chips, SectionDivider,
  cardSt, sectionTitleSt, FEATURES_OPTIONS, SERVICE_TYPES_OPTIONS,
  FUEL_TYPE_OPTIONS, PERMIT_TYPE_OPTIONS,
  type NewCabFormState,
} from './shared'

interface Props {
  form:     NewCabFormState
  errors:   Record<string, string>
  onChange: (patch: Partial<NewCabFormState>) => void
  clearError:(key: string) => void
}

export default function StepSpecs({ form, errors, onChange, clearError }: Props) {
  return (
    <div style={cardSt}>
      <h2 style={sectionTitleSt}>Specs & Features</h2>

      <SectionDivider title="Capacity" />
      <Grid cols={3}>
        <FField label="Seating Capacity" required error={errors.seating}>
          <FInput
            value={form.seatingCap}
            onChange={v => { onChange({ seatingCap: parseInt(v) || 1 }); clearError('seating') }}
            type="number" placeholder="7"
            error={!!errors.seating}
          />
        </FField>
        <FField label="Luggage Bags">
          <FInput
            value={form.luggageCap}
            onChange={v => onChange({ luggageCap: parseInt(v) || 0 })}
            type="number" placeholder="3"
          />
        </FField>
        <FField label="Air Conditioning">
          <div style={{ paddingTop: 8 }}>
            <Toggle label="AC Available" checked={form.isAc} onChange={v => onChange({ isAc: v })} />
          </div>
        </FField>
      </Grid>

      <SectionDivider title="Vehicle Specs" />
      <Grid cols={2}>
        <FField label="Fuel Type">
          <FSelect value={form.fuelType} onChange={v => onChange({ fuelType: v })}
            options={FUEL_TYPE_OPTIONS} />
        </FField>
        <FField label="Permit Type">
          <FSelect value={form.permitType} onChange={v => onChange({ permitType: v })}
            options={PERMIT_TYPE_OPTIONS} />
        </FField>
      </Grid>

      <SectionDivider title="Features" />
      <Chips
        options={FEATURES_OPTIONS.map(f => ({ value: f, label: f }))}
        selected={form.features}
        onChange={v => onChange({ features: v })}
      />

      <SectionDivider title="Service Types" />
      <Chips
        options={SERVICE_TYPES_OPTIONS}
        selected={form.serviceTypes}
        onChange={v => onChange({ serviceTypes: v })}
      />
    </div>
  )
}