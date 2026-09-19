/**
 * src/components/admin/wizard/icons/index.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom SVG icon set for the Add Property wizard.
 * No emojis anywhere — all brand-aligned line icons.
 *
 * Usage:
 *   import { HotelIcon, ResortIcon } from './icons'
 *   <HotelIcon color="#1A1A1A" size={20} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface IconProps {
  color?: string
  size?:  number
}

const D = '#1A1A1A' // default color

// ── Property Types ────────────────────────────────────────────────────────────

export function HotelIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="13" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M6 6V3.5a4 4 0 018 0V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="12" width="4" height="5" rx="0.5" fill={color} opacity="0.5" />
      <rect x="4" y="10" width="2.5" height="2.5" rx="0.3" fill={color} opacity="0.4" />
      <rect x="13.5" y="10" width="2.5" height="2.5" rx="0.3" fill={color} opacity="0.4" />
    </svg>
  )
}

export function ResortIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3C10 3 4 7 4 12h12c0-5-6-9-6-9z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 12v5M13 12v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 17h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="8" r="1.5" fill={color} opacity="0.5" />
    </svg>
  )
}

export function BoutiqueIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 19V9l7-6 7 6v10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="8" y="13" width="4" height="5" rx="0.5" stroke={color} strokeWidth="1.3" />
      <path d="M6.5 9.5h3M10.5 9.5h3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 3v3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function HeritageIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M2 19h16M3 19V9M17 19V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 9h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 9V6h2v3M9 9V6h2v3M13 9V6h2v3" stroke={color} strokeWidth="1.3" />
      <path d="M6 6V4.5C6 3.7 7 3 10 3s4 .7 4 1.5V6" stroke={color} strokeWidth="1.3" />
      <rect x="8.5" y="13" width="3" height="5" rx="0.3" fill={color} opacity="0.4" />
    </svg>
  )
}

export function VillaIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M2 19V11l8-7 8 7v8" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="7" y="13" width="6" height="5" rx="0.5" stroke={color} strokeWidth="1.3" />
      <circle cx="14.5" cy="8.5" r="2" stroke={color} strokeWidth="1.2" />
      <path d="M4 14h2M14 14h2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function HomestayIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M1 10L10 2l9 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8.5V18h5.5v-5h3V18H17V8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ServiceAptIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="17" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M3 7h14M3 12h14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="6" y="9" width="2" height="2" rx="0.3" fill={color} opacity="0.5" />
      <rect x="12" y="9" width="2" height="2" rx="0.3" fill={color} opacity="0.5" />
      <rect x="6" y="14" width="2" height="2" rx="0.3" fill={color} opacity="0.5" />
      <rect x="12" y="14" width="2" height="2" rx="0.3" fill={color} opacity="0.5" />
    </svg>
  )
}

export function HostelIcon({ color = D, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M2 10h16" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 5V3M14 5V3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <rect x="5" y="12" width="3" height="3" rx="0.3" fill={color} opacity="0.5" />
      <rect x="12" y="12" width="3" height="3" rx="0.3" fill={color} opacity="0.5" />
    </svg>
  )
}

// ── Owner mode ────────────────────────────────────────────────────────────────

export function UnoOwnIcon({ color = D, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 8v13h18V8L12 2z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="9" y="14" width="6" height="7" rx="0.5" stroke={color} strokeWidth="1.4" />
      <circle cx="12" cy="10" r="2" fill={color} opacity="0.5" />
    </svg>
  )
}

export function PartnerIcon({ color = D, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="8" r="3.5" stroke={color} strokeWidth="1.5" />
      <path d="M2 20c0-3 2.7-5 6-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 20c0-3-2.7-5-6-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 20c0-2.8 4-2.8 4 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Step icons (used in progress bar) ────────────────────────────────────────

export function StepBasicIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.4" />
      <path d="M5 5h6M5 8h6M5 11h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function StepLocationIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5z" stroke={color} strokeWidth="1.4" />
      <circle cx="8" cy="6" r="1.5" fill={color} opacity="0.6" />
    </svg>
  )
}

export function StepAmenitiesIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M8 2v12" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5" cy="5" r="1.5" fill={color} opacity="0.5" />
      <circle cx="11" cy="5" r="1.5" fill={color} opacity="0.5" />
      <circle cx="5" cy="11" r="1.5" fill={color} opacity="0.5" />
      <circle cx="11" cy="11" r="1.5" fill={color} opacity="0.5" />
    </svg>
  )
}

export function StepPoliciesIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L2 3.5v5C2 11.5 4.7 14 8 14.5 11.3 14 14 11.5 14 8.5v-5L8 1z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.5 8l2 2 3-3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StepContactIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke={color} strokeWidth="1.4" />
      <path d="M1.5 5.5l6.5 4 6.5-4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function StepRoomsIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1.5 10V6a2 2 0 012-2h9a2 2 0 012 2v4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1 10h14v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2z" stroke={color} strokeWidth="1.4" />
      <path d="M5 6.5h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="4.5" cy="8" r="1" fill={color} opacity="0.5" />
      <circle cx="11.5" cy="8" r="1" fill={color} opacity="0.5" />
    </svg>
  )
}

export function StepDiningIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M5 2v4c0 1.1.9 2 2 2v6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M3.5 2v2.5M5 2v2.5M6.5 2v2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 2c0 0 2 1.5 2 4s-2 4-2 4v4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StepPhotosIcon({ color = D, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke={color} strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.3" />
      <circle cx="12.5" cy="5" r="0.8" fill={color} />
    </svg>
  )
}

export function CheckIcon({ color = D, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3.5 3.5 5.5-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}