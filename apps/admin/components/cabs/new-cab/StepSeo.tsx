'use client'
// src/components/admin/cabs/new-cab/StepSeo.tsx

import { tokens } from '@/lib/tokens'
import {
  FField, FInput, FTextarea, Grid, SectionDivider,
  cardSt, sectionTitleSt, type NewCabFormState,
} from './shared'

interface Props {
  form:     NewCabFormState
  onChange: (patch: Partial<NewCabFormState>) => void
}

export default function StepSeo({ form, onChange }: Props) {
  return (
    <div style={cardSt}>
      <h2 style={sectionTitleSt}>SEO</h2>

      <SectionDivider title="Meta Tags" />
      <Grid cols={2}>
        <FField label="SEO Title" hint="Recommended: 50–60 characters">
          <FInput value={form.seoTitle} onChange={v => onChange({ seoTitle: v })}
            placeholder="Best SUV Cab Hire — Toyota Innova Crysta" />
        </FField>
        <FField label="SEO Keywords">
          <FInput value={form.seoKeywords} onChange={v => onChange({ seoKeywords: v })}
            placeholder="innova crysta, suv cab, 7 seater hire…" />
        </FField>
      </Grid>

      <div style={{ marginTop: 14 }}>
        <FField label="SEO Meta Description" hint="Recommended: 140–160 characters">
          <FTextarea value={form.seoDesc} onChange={v => onChange({ seoDesc: v })} rows={3}
            placeholder="Hire a spacious Toyota Innova Crysta for comfortable family trips…" />
          <div style={{ textAlign:'right', fontSize:11, marginTop:3,
            color: form.seoDesc.length > 160 ? tokens.red : tokens.text3 }}>
            {form.seoDesc.length}/160
          </div>
        </FField>
      </div>

      <SectionDivider title="Sitemap Preview" />
      <div style={{ padding:'12px 16px', background:'#F8FAFF', borderRadius:tokens.radius.md, border:`1px solid ${tokens.blueBorder}`, fontFamily:tokens.font.mono, fontSize:12, color:tokens.blueText, lineHeight:1.7, wordBreak:'break-all' }}>
        {`<url><loc>https://unotrips.com/cabs/${form.slug || '<auto-slug>'}</loc>`}<br />
        {`<changefreq>monthly</changefreq><priority>0.8</priority></url>`}
      </div>
    </div>
  )
}