'use client'
// src/components/admin/cabs/new-cab/StepDriver.tsx

import { tokens } from '@/lib/tokens'
import {
  FField, FInput, FTextarea, Grid, Toggle, SectionDivider,
  cardSt, sectionTitleSt, type NewCabFormState,
} from './shared'

interface Props {
  form:      NewCabFormState
  errors:    Record<string, string>
  onChange:  (patch: Partial<NewCabFormState>) => void
  clearError:(key: string) => void
}

export default function StepDriver({ form, errors, onChange, clearError }: Props) {
  return (
    <div style={cardSt}>
      <h2 style={sectionTitleSt}>Owner, Driver & Vehicle</h2>

      {/* ── Owner Details (optional) ───────────────────────────────────── */}
      <SectionDivider title="Owner Details (Optional)" />
      <div style={{ padding:'12px 16px', marginBottom:16, background:'#FFF8F0', border:`1px solid #FDBA74`, borderRadius:tokens.radius.md, fontSize:12, color:'#92400E', lineHeight:1.6 }}>
        <strong>💡 Optional</strong> — Fill these if you're listing an independently owned cab. If you have a formal owner record, link it from the Cab Details step via the Owner dropdown instead.
      </div>
      <Grid cols={3}>
        <FField label="Owner Name">
          <FInput value={form.ownerName} onChange={v => onChange({ ownerName: v })}
            placeholder="Ramesh Kumar" />
        </FField>
        <FField label="Owner Phone">
          <FInput value={form.ownerPhone} onChange={v => onChange({ ownerPhone: v })}
            placeholder="+91 98765 43210" />
        </FField>
        <FField label="Owner Email">
          <FInput value={form.ownerEmail} onChange={v => onChange({ ownerEmail: v })}
            placeholder="owner@email.com" />
        </FField>
      </Grid>

      {/* ── Vehicle toggle ─────────────────────────────────────────────── */}
      <div style={{ padding:'14px 18px', margin:'22px 0', background:tokens.blueLight, border:`1px solid ${tokens.blueBorder}`, borderRadius:tokens.radius.md, fontSize:13, color:tokens.blueText, lineHeight:1.6 }}>
        <strong>ℹ️ Internal only</strong> — vehicle and driver details are never shown to guests.
      </div>

      <div style={{ marginBottom:20 }}>
        <Toggle
          label="Register a vehicle now"
          checked={form.addVehicleNow}
          onChange={v => onChange({ addVehicleNow: v })}
          hint="You can also add vehicles later from the Vehicles page"
        />
      </div>

      {form.addVehicleNow ? (
        <>
          <SectionDivider title="Vehicle Info" />
          <Grid cols={2}>
            <FField label="Registration Number" required error={errors.reg_number}>
              <FInput value={form.regNumber}
                onChange={v => { onChange({ regNumber: v.toUpperCase() }); clearError('reg_number') }}
                placeholder="DL 01 AB 1234" mono error={!!errors.reg_number} />
            </FField>
            <FField label="Vehicle Model" hint="e.g. Innova Crysta 2022 White">
              <FInput value={form.vehicleModel} onChange={v => onChange({ vehicleModel: v })}
                placeholder="Toyota Innova Crysta 2022" />
            </FField>
            <FField label="Vehicle Color">
              <FInput value={form.vehicleColor} onChange={v => onChange({ vehicleColor: v })}
                placeholder="Pearl White" />
            </FField>
            <FField label="Base City" hint="City where this vehicle is stationed">
              <FInput value={form.baseCity} onChange={v => onChange({ baseCity: v })}
                placeholder="Delhi" />
            </FField>
          </Grid>

          <SectionDivider title="Driver Details" />
          <Grid cols={2}>
            <FField label="Driver Name" required error={errors.driver_name}>
              <FInput value={form.driverName}
                onChange={v => { onChange({ driverName: v }); clearError('driver_name') }}
                placeholder="Rajesh Kumar" error={!!errors.driver_name} />
            </FField>
            <FField label="Driver Phone" required error={errors.driver_phone}>
              <FInput value={form.driverPhone}
                onChange={v => { onChange({ driverPhone: v }); clearError('driver_phone') }}
                placeholder="+91 98765 43210" error={!!errors.driver_phone} />
            </FField>
          </Grid>

          <div style={{ margin:'4px 0 18px' }}>
            <Toggle
              label="WhatsApp same as phone number"
              checked={form.wasSame}
              onChange={v => onChange({ wasSame: v })}
            />
            {!form.wasSame && (
              <div style={{ marginTop: 14 }}>
                <FField label="WhatsApp Number">
                  <FInput value={form.driverWhatsapp}
                    onChange={v => onChange({ driverWhatsapp: v })}
                    placeholder="+91 98765 43210" />
                </FField>
              </div>
            )}
          </div>

          <Grid cols={2}>
            <FField label="Driver License No.">
              <FInput value={form.driverLicense} onChange={v => onChange({ driverLicense: v })}
                placeholder="DL-0420110012345" mono />
            </FField>
            <FField label="Driver PAN" hint="Encrypted at rest. Masked in all views.">
              <FInput value={form.driverPan}
                onChange={v => onChange({ driverPan: v.toUpperCase() })}
                placeholder="ABCDE1234F" mono />
            </FField>
          </Grid>

          <div style={{ marginTop: 14 }}>
            <FField label="Internal Notes">
              <FTextarea value={form.vehicleNotes}
                onChange={v => onChange({ vehicleNotes: v })} rows={2}
                placeholder="Any internal notes about this vehicle or driver…" />
            </FField>
          </div>
        </>
      ) : (
        <div style={{ padding:'32px 24px', textAlign:'center', border:`1.5px dashed ${tokens.border}`, borderRadius:tokens.radius.lg, color:tokens.text3 }}>
          <div style={{ fontSize:28, marginBottom:10 }}>🚗</div>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>No vehicle registered yet</div>
          <div style={{ fontSize:12, lineHeight:1.6 }}>
            Enable "Register a vehicle now" above, or add vehicles later from the Vehicles page.
          </div>
        </div>
      )}
    </div>
  )
}