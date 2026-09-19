/**
 * src/components/admin/wizard/WizardLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared layout wrapper used by AddPropertyWizard.
 *
 * Fixes: maxWidth was 760px which left massive dead space on wide screens.
 * Now uses a two-column layout:
 *   Left  — step progress sidebar (fixed 220px)
 *   Right — form content (fills remaining width, max 860px)
 *
 * This matches how premium dashboards (Stripe, Vercel, Linear) handle
 * multi-step forms — progress on the left, content on the right.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReactElement, ReactNode } from 'react'
import { tokens } from '@/lib/tokens'
import { STEPS } from './types'
import {
  StepBasicIcon, StepLocationIcon, StepAmenitiesIcon,
  StepPoliciesIcon, StepContactIcon, StepRoomsIcon,
  StepDiningIcon, StepPhotosIcon, CheckIcon,
} from './icons'

type Step = typeof STEPS[number]

// ── Step icon map ─────────────────────────────────────────────────────────────

const STEP_ICONS: Record<number, (props: { color: string; size: number }) => ReactElement> = {
  1: StepBasicIcon,
  2: StepLocationIcon,
  3: StepAmenitiesIcon,
  4: StepPoliciesIcon,
  5: StepContactIcon,
  6: StepRoomsIcon,
  7: StepDiningIcon,
  8: StepPhotosIcon,
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  steps:       Step[]
  currentStep: number
  onStepClick: (n: number) => void
  header: {
    stepLabel: string
    title:     string
    badge?:    string
  }
  footer: React.ReactNode
  children: React.ReactNode
}

// ── Step sidebar item ─────────────────────────────────────────────────────────

function StepItem({
  step, current, clickable, onClick,
}: {
  step:      Step
  current:   number
  clickable: boolean
  onClick:   () => void
}) {
  const past    = current > step.number
  const active  = current === step.number
  const Icon    = STEP_ICONS[step.number] ?? StepBasicIcon

  const color = active ? tokens.gold
    : past    ? tokens.green
    : 'rgba(0,0,0,0.28)'

  const labelColor = active ? tokens.text
    : past           ? tokens.text2
    : tokens.text3

  return (
    <button
      type="button"
      onClick={() => { if (clickable) onClick() }}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         12,
        width:       '100%',
        padding:     '9px 14px',
        borderRadius: tokens.radius.md,
        border:      'none',
        background:  active ? tokens.goldLight : 'transparent',
        cursor:      clickable ? 'pointer' : 'default',
        textAlign:   'left',
        fontFamily:  tokens.font.sans,
        transition:  'background 0.15s',
      }}
      onMouseEnter={e => {
        if (clickable && !active) (e.currentTarget as HTMLButtonElement).style.background = tokens.surface
      }}
      onMouseLeave={e => {
        if (clickable && !active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {/* Icon circle */}
      <div style={{
        width:          30,
        height:         30,
        borderRadius:   '50%',
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     active ? tokens.gold
          : past        ? tokens.green
          : tokens.surface,
        border:         active ? `1px solid ${tokens.gold}`
          : past        ? `1px solid ${tokens.green}`
          : `1px solid ${tokens.border}`,
        transition:     'all 0.2s',
      }}>
        {past ? (
          <CheckIcon color="#fff" size={12} />
        ) : (
          <Icon color={active ? '#fff' : color} size={14} />
        )}
      </div>

      {/* Label */}
      <div>
        <div style={{
          fontSize:   11,
          fontWeight: active ? 700 : past ? 600 : 500,
          color:      labelColor,
          lineHeight: 1.3,
        }}>
          {step.label}
        </div>
        <div style={{
          fontSize: 10,
          color:    active ? tokens.goldText : tokens.text3,
          marginTop: 1,
        }}>
          Step {step.number} of 8
        </div>
      </div>
    </button>
  )
}

// ── Main layout ───────────────────────────────────────────────────────────────

export default function WizardLayout({
  steps, currentStep, onStepClick, header, footer, children,
}: Props) {
  return (
    <div style={{
      display:   'flex',
      gap:       24,
      alignItems: 'flex-start',
      padding:   '0 4px',
    }}>

      {/* ── Left: step progress sidebar ──────────────────────────────────── */}
      <div style={{
        width:        220,
        minWidth:     220,
        background:   tokens.white,
        border:       `1px solid ${tokens.border}`,
        borderRadius: tokens.radius.lg,
        padding:      '16px 8px',
        position:     'sticky',
        top:          24,
      }}>
        <div style={{
          fontSize:      10,
          fontWeight:    700,
          color:         tokens.text3,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding:       '0 14px 12px',
          borderBottom:  `1px solid ${tokens.border}`,
          marginBottom:  8,
        }}>
          Progress
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map(s => (
            <StepItem
              key={s.number}
              step={s}
              current={currentStep}
              clickable={currentStep > s.number}
              onClick={() => onStepClick(s.number)}
            />
          ))}
        </div>
      </div>

      {/* ── Right: form card ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Card header */}
        <div style={{
          background:    tokens.white,
          border:        `1px solid ${tokens.border}`,
          borderRadius:  `${tokens.radius.lg} ${tokens.radius.lg} 0 0`,
          padding:       '20px 28px',
          borderBottom:  `1px solid ${tokens.border}`,
          display:       'flex',
          alignItems:    'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize:      10,
              fontWeight:    700,
              color:         tokens.text3,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom:  4,
            }}>
              {header.stepLabel}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text }}>
              {header.title}
            </div>
          </div>
          {header.badge && (
            <div style={{
              fontSize:     12,
              fontWeight:   600,
              color:        tokens.text2,
              background:   tokens.surface,
              border:       `1px solid ${tokens.border}`,
              borderRadius: tokens.radius.md,
              padding:      '6px 12px',
            }}>
              {header.badge}
            </div>
          )}
        </div>

        {/* Form content */}
        <div style={{
          background:    tokens.white,
          border:        `1px solid ${tokens.border}`,
          borderTop:     'none',
          padding:       '28px 28px',
        }}>
          {children}
        </div>

        {/* Navigation footer */}
        <div style={{
          background:    tokens.white,
          border:        `1px solid ${tokens.border}`,
          borderTop:     `1px solid ${tokens.border}`,
          borderRadius:  `0 0 ${tokens.radius.lg} ${tokens.radius.lg}`,
          padding:       '16px 28px',
        }}>
          {footer}
        </div>
      </div>
    </div>
  )
}