'use client'

/**
 * WizardStep8.tsx — Step 8: Photos & Agreements
 * ─────────────────────────────────────────────────────────────────────────────
 * Three sections in one step:
 *
 *  A. PROPERTY PHOTOS
 *     Required: Exterior, Lobby (min 3 each, max 10)
 *     Optional: Pool, Spa, Gym, Dining, Bar, Garden, Rooftop, Views, Kids
 *     Stored in → property.photo_categories[]
 *
 *  B. ROOM PHOTOS
 *     One upload panel per room type added in Step 6 (min 1, max 8)
 *     Stored in → room_types[i].images[]
 *     These are exactly what the hotel detail page shows on each room card.
 *
 *  C. PARTNER AGREEMENTS
 *     Four collapsible policy sections — each with full text + checkbox.
 *     All four must be checked before the wizard Submit button unlocks.
 *     Stored in → agreements.{ terms, cancellation, payment, legal }_accepted
 *
 * Drag-to-reorder: native HTML5 drag events, no library dependency.
 * First image in every block = Main photo (shown with gold "Main" badge).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { WizardData } from './types'
import { UploadQueue } from '@/components/image-upload/core/queue'
import { getAdminToken } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — PROPERTY PHOTO CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FILE_MB = 10

const MIN_PROPERTY_CAT = 3   // minimum photos per property category
const MAX_PROPERTY_CAT = 10  // maximum photos per property category

const MIN_ROOM_PHOTOS = 1    // minimum photos per room type
const MAX_ROOM_PHOTOS = 8    // maximum photos per room type

interface PhotoCat { key: string; label: string; emoji: string; required: boolean }

const PROPERTY_PHOTO_CATS: PhotoCat[] = [
  { key: 'exterior', label: 'Exterior',        emoji: '🏨', required: true  },
  { key: 'lobby',    label: 'Lobby & Common',  emoji: '🛋️', required: true  },
  { key: 'pool',     label: 'Pool',            emoji: '🏊', required: false },
  { key: 'spa',      label: 'Spa & Wellness',  emoji: '💆', required: false },
  { key: 'gym',      label: 'Gym & Fitness',   emoji: '🏋️', required: false },
  { key: 'dining',   label: 'Dining',          emoji: '🍽️', required: false },
  { key: 'bar',      label: 'Bar & Lounge',    emoji: '🍸', required: false },
  { key: 'garden',   label: 'Garden',          emoji: '🌿', required: false },
  { key: 'rooftop',  label: 'Rooftop',         emoji: '🏙️', required: false },
  { key: 'views',    label: 'Views & Scenery', emoji: '🌅', required: false },
  { key: 'kids',     label: 'Kids Area',       emoji: '🎠', required: false },
]

const REQUIRED_PROP_CATS = PROPERTY_PHOTO_CATS.filter(c => c.required)
const OPTIONAL_PROP_CATS = PROPERTY_PHOTO_CATS.filter(c => !c.required)

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C — PARTNER AGREEMENT DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

type AgreementKey = 'terms_accepted' | 'cancellation_accepted' | 'payment_accepted' | 'legal_accepted'

interface Agreement {
  key:     AgreementKey
  emoji:   string
  title:   string
  label:   string   // checkbox label
  content: string   // full policy text shown in accordion
}

const AGREEMENTS: Agreement[] = [
  {
    key:   'terms_accepted',
    emoji: '📋',
    title: 'Terms & Conditions',
    label: 'I have read and agree to the KBC Trip Hotels Partner Terms & Conditions',
    content: `By listing your property on KBC Trip Hotels & Resorts, you agree to the following:

1. LISTING ACCURACY
   All information provided (photos, amenities, room details, pricing) must be accurate and kept up to date. Misleading or outdated listings may result in immediate suspension.

2. PRICING INTEGRITY
   Room prices listed on the platform are final and inclusive of all mandatory charges. Collecting additional charges from guests at the property that are not disclosed on the platform is strictly prohibited.

3. AVAILABILITY MANAGEMENT
   You are responsible for keeping your availability calendar accurate at all times. Failure to honour a confirmed booking is a breach of this agreement and may result in penalties and account suspension.

4. PLATFORM COMMISSION
   KBC Trip Hotels retains a platform service commission (currently 15%) on every confirmed booking. This commission is automatically deducted from your payout — you never handle it manually.

5. NO SOLICITATION
   You agree not to solicit direct bookings from, or establish commercial relationships with, guests who were introduced through the KBC Trip Hotels platform.

6. CONTENT LICENSE
   By uploading photos and descriptions to this platform, you grant KBC Trip Hotels a non-exclusive, royalty-free, worldwide license to display, reproduce, and promote this content across all KBC Trip Hotels marketing channels (website, mobile app, email, social media, advertising).

7. ACCOUNT INTEGRITY
   You are responsible for all activity under your account. Do not share your login credentials. Report any suspected unauthorised access to support@unohotelsandresorts.com immediately.`,
  },
  {
    key:   'cancellation_accepted',
    emoji: '🔄',
    title: 'Cancellation Policy',
    label: 'I understand and accept the KBC Trip Hotels Cancellation & Refund Policy',
    content: `GUEST CANCELLATIONS

Standard cancellation window:
• Free cancellation: Guests may cancel at no charge up to 48 hours before check-in.
• Late cancellation (within 48 hrs of check-in): The guest forfeits the first night's room charge. KBC Trip Hotels will process this partial amount to your payout within 7 business days.

No-show policy:
• If a confirmed guest does not arrive and has not cancelled, you may mark the booking as "No Show" in your Partner Dashboard. The first night charge is retained and credited to you in the next payout cycle.

Property-specific policy:
• The cancellation terms you entered in Step 4 (Policies) also apply and are shown to guests before booking. Ensure they are accurate.

──────────────────────────────

PARTNER-INITIATED CANCELLATIONS

Partners must not cancel confirmed bookings except in cases of genuine force majeure — natural disaster, government-mandated closure, or major structural damage rendering the property uninhabitable.

• Cancelling a confirmed booking without a valid, documented reason may result in:
  – A financial penalty equal to the full booking value
  – A negative impact on your property's ranking on the platform
  – Suspension or permanent termination of your partner account

• If you must cancel due to force majeure, contact partner-support@unohotelsandresorts.com immediately with supporting documentation.

──────────────────────────────

REFUND PROCESSING

• Guest refunds are processed by KBC Trip Hotels via the original payment method within 5–7 business days of approval.
• Refunds for valid guest cancellations within the free-cancellation window do not affect your payout for other bookings.
• Refunds triggered by a partner-initiated cancellation are fully borne by the partner.`,
  },
  {
    key:   'payment_accepted',
    emoji: '💳',
    title: 'Payment & Payout Terms',
    label: 'I understand and accept the KBC Trip Hotels Payment & Payout Terms',
    content: `GUEST PAYMENT COLLECTION

• All guest payments are collected exclusively by KBC Trip Hotels through Razorpay (UPI, debit/credit cards, net banking, EMI on eligible cards).
• You must NOT collect any payment — full or partial — directly from guests for bookings made through the KBC Trip Hotels platform. Doing so is a breach of this agreement.

──────────────────────────────

PAYOUT CALCULATION

Your payout per confirmed booking is calculated as:

  Room Charges                          = Base price × nights × rooms
  (–) Platform Commission (15%)         = Room Charges × 0.15
  (–) TDS — Tax Deducted at Source (0.1%) = Room Charges × 0.001
  ─────────────────────────────────────────────
  Partner Payout                        = Room Charges – Commission – TDS

Note: Hotel Tax (5%) and TCS (0.5%) are charged to the guest and are not deducted from your payout — they are remitted to the government by KBC Trip Hotels.

──────────────────────────────

PAYOUT SCHEDULE

• Payouts are processed every 7 calendar days for all bookings where check-out has occurred in the prior period.
• Payouts are transferred via NEFT/IMPS to the bank account registered during KYC.
• Processing time after transfer initiation: 1–2 business days (bank-dependent).

──────────────────────────────

TAX COMPLIANCE

• TDS at 0.1% is deducted from your payout under Section 194-O of the Income Tax Act, 1961 (applicable to e-commerce operators).
• Form 16A (TDS certificate) will be provided to you quarterly. You may use this to claim TDS credit when filing your income tax return.
• TCS (Tax Collected at Source) at 0.5% is collected from the guest and is KBC Trip Hotels' responsibility to remit — it does not affect your payout.

──────────────────────────────

BANK ACCOUNT & INVOICING

• Ensure your bank account details (account number, IFSC, account holder name) are accurate in your KYC profile. Incorrect details that cause failed transfers may delay payouts by up to 14 business days.
• A monthly payout settlement statement is provided in your Partner Dashboard, detailing all bookings, deductions, and net amounts for that period.`,
  },
  {
    key:   'legal_accepted',
    emoji: '⚖️',
    title: 'Legal Declarations',
    label: 'I confirm the legal declarations and compliance requirements',
    content: `By submitting this property listing on KBC Trip Hotels & Resorts, I declare and confirm the following:

1. OWNERSHIP & AUTHORITY
   I am the sole owner of this property, OR I am a duly authorised representative of the owner with full legal authority to list this property on third-party accommodation platforms. Proof of authorisation may be requested by KBC Trip Hotels at any time.

2. STATUTORY LICENSING & COMPLIANCE
   This property currently holds, or is in the process of obtaining, all applicable licences and registrations required by local, state, and central government law, including but not limited to:
   – Hotel/accommodation establishment registration
   – Fire NOC and building safety certificate
   – Health, hygiene, and sanitation compliance
   – FSSAI food safety licence (where dining services are offered to guests)
   – Any tourism or hospitality permits required by the state government

3. GST REGISTRATION
   My business GST registration (GSTIN), if applicable, is valid, active, and current. I understand that KBC Trip Hotels may request a copy of my GST certificate at any time, and that listing may be suspended if GST compliance lapses.

4. TDS ACKNOWLEDGEMENT — SECTION 194-O
   I acknowledge that TDS at 0.1% will be deducted from every payout under Section 194-O of the Income Tax Act, 1961. KBC Trip Hotels will issue Form 16A (TDS certificate) on a quarterly basis. I am responsible for filing this credit in my own income tax return.

5. ACCURACY OF INFORMATION
   All information provided during registration (KYC, bank details, property details, room types, photos, amenities, policies) is true, accurate, and complete to the best of my knowledge. I understand that providing false, misleading, or fraudulent information may result in:
   – Immediate suspension or permanent termination of my partner account
   – Recovery of any payouts made based on false information
   – Referral to the appropriate legal authorities

6. GUEST SAFETY STANDARDS
   I confirm that this property meets minimum safety standards for guests, including functional fire exits, proper electrical wiring, structural integrity, and adequate sanitation. I will notify KBC Trip Hotels immediately if the property becomes temporarily uninhabitable due to damage or safety issues.

7. DATA PROTECTION
   I consent to KBC Trip Hotels storing and processing the personal and business data I have provided in accordance with the KBC Trip Hotels Privacy Policy, for the purpose of operating my partner account and processing bookings.

8. DISPUTE RESOLUTION & JURISDICTION
   Any dispute between me and KBC Trip Hotels arising from this listing or any booking shall first be attempted to be resolved through good-faith mediation. If mediation fails, the dispute shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India. Governing law: laws of the Republic of India.`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type LoadingMap = Record<number, boolean>

interface Props {
  data: WizardData
  set:  <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
  // AUDIT FIX — needed so photo uploads can go straight to this
  // property's permanent storage path instead of a temp folder. Passed
  // by the Edit Property page (which has a real id); omitted entirely
  // by the Add Property wizard, where no property exists yet — see
  // PhotoUploadBlockProps' propertyId doc-comment for the full picture.
  propertyId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const sectionLabel = (emoji: string, text: string, sub?: string): React.ReactNode => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
    <span style={{ fontSize: 16 }}>{emoji}</span>
    <span style={{
      fontSize: 11, fontWeight: 800, color: tokens.text3,
      textTransform: 'uppercase', letterSpacing: '0.10em',
    }}>{text}</span>
    {sub && (
      <span style={{ fontSize: 11, fontWeight: 400, color: tokens.text3, textTransform: 'none', letterSpacing: 0 }}>
        — {sub}
      </span>
    )}
  </div>
)

const badge = (text: string): React.ReactNode => (
  <span style={{
    fontSize: 9, fontWeight: 700, color: tokens.amberText,
    background: tokens.amberLight, border: `1px solid ${tokens.amberBorder}`,
    padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
  }}>{text}</span>
)

const infoBanner = (msg: React.ReactNode, type: 'amber' | 'green' | 'blue'): React.ReactNode => {
  const colour = {
    amber: { bg: tokens.amberLight, border: tokens.amberBorder, text: tokens.amberText },
    green: { bg: tokens.greenLight, border: tokens.greenBorder, text: tokens.greenText },
    blue:  { bg: tokens.blueLight,  border: tokens.blueBorder,  text: tokens.blueText  },
  }[type]
  return (
    <div style={{
      padding: '10px 14px', marginBottom: 14,
      background: colour.bg, border: `1px solid ${colour.border}`,
      borderRadius: tokens.radius.sm, fontSize: 12, color: colour.text, lineHeight: 1.65,
    }}>{msg}</div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: PhotoUploadBlock
// Used by both property categories and room photo sections.
// ─────────────────────────────────────────────────────────────────────────────

interface PhotoUploadBlockProps {
  title:        string
  subtitle?:    string
  emoji:        string
  images:       string[]
  minPhotos:    number
  maxPhotos:    number
  required?:    boolean
  accentColor?: string
  onUpdate:     (images: string[]) => void
  onRemove?:    () => void
  // AUDIT FIX — needed to upload the real file to
  // POST /admin/v1/properties/upload-photo instead of converting to
  // base64 and embedding it in the wizard's JSON payload. category is
  // the photo category key (e.g. "exterior", "room") sent as the form
  // field the backend expects. propertyId is the REAL property UUID
  // when editing an existing property (uploads go straight to its
  // permanent path); omitted entirely for a brand-new property in the
  // Add Property wizard, where the backend uploads to an isolated temp
  // folder instead, relocated to the permanent path once the property
  // is actually created — see create_property()'s temp-relocation step.
  category:     string
  propertyId?:  string
}

function PhotoUploadBlock({
  title, subtitle, emoji, images,
  minPhotos, maxPhotos, required,
  accentColor, onUpdate, onRemove,
  category, propertyId,
}: PhotoUploadBlockProps) {

  // ── State & refs ────────────────────────────────────────────────────────────
  const fileInputRef           = useRef<HTMLInputElement | null>(null)
  const [loadingMap, setLoading] = useState<LoadingMap>({})
  const dragFromIdx            = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const count     = images.length
  const isDone    = count >= minPhotos
  const isFull    = count >= maxPhotos
  const shortfall = Math.max(0, minPhotos - count)
  const accent    = accentColor ?? tokens.gold

  // Always-current images ref — onSuccess/onError fire asynchronously,
  // potentially after `images` (the prop) has already moved on to a
  // newer value via a parent re-render (e.g. another slot in this same
  // batch resolved first and called onUpdate). Reading from this ref
  // instead of the `images` closure avoids clobbering those updates.
  const imagesRef = useRef(images)
  imagesRef.current = images

  // One shared queue per block instance — created once, reused across
  // every file ever selected in this block (new property photo, room
  // photo, etc.). Concurrency-limited, retries with backoff, compresses
  // client-side before upload — see core/queue.ts.
  const queueRef = useRef<UploadQueue | null>(null)
  function getQueue(): UploadQueue {
    if (!queueRef.current) {
      queueRef.current = new UploadQueue({
        endpoint:   '/admin/v1/properties/upload-photo',
        category,
        // '' (falsy) → uploader.ts omits the property_id form field
        // entirely → backend uploads to its isolated temp folder
        // instead of a permanent path. Real propertyId (editing an
        // existing property) → uploads straight to its permanent path.
        propertyId: propertyId ?? '',
        getToken:   getAdminToken,
      })
    }
    return queueRef.current
  }

  // ── Upload handler ──────────────────────────────────────────────────────────
  // AUDIT FIX — real upload via the shared image-upload subsystem
  // (already used by packages/blog/cabs/website) instead of converting
  // to base64 and embedding the file in the wizard's JSON payload. Base64
  // inflates the payload ~33% on top of the original file size, which
  // breaks outright once a real photo pushes the request past the
  // frontend's body-size limit. Points at the new, dedicated
  // POST /admin/v1/properties/upload-photo endpoint (mirrors Ops's
  // already-hardened upload-first model exactly) — both panels now
  // share one upload code path end to end.
  function handleFileInput(files: FileList | null) {
    if (!files || isFull) return
    const canAdd = maxPhotos - count

    const accepted: File[] = Array.from(files)
      .slice(0, canAdd)
      .filter(f => f.type.startsWith('image/') && f.size <= MAX_FILE_MB * 1024 * 1024)

    if (!accepted.length) return

    // Insert loading placeholders immediately for instant feedback —
    // identical UI pattern to before, just resolved by a real network
    // upload now instead of a synchronous base64 FileReader read.
    const startIdx     = count
    const placeholders = accepted.map((_, i) => `loading:${startIdx + i}`)
    const withPlaceholders = [...images, ...placeholders]
    imagesRef.current = withPlaceholders
    onUpdate(withPlaceholders)

    const newMap: LoadingMap = {}
    placeholders.forEach((_, i) => { newMap[startIdx + i] = true })
    setLoading(prev => ({ ...prev, ...newMap }))

    const queue = getQueue()

    accepted.forEach((file, i) => {
      const slotIdx    = startIdx + i
      const controller = new AbortController()

      queue.enqueue(`${title}-${slotIdx}-${Date.now()}`, file, controller, {
        onCompressing: () => {},
        onUploading:   () => {},
        onProgress:    () => {},
        onRetry:       () => {},

        onSuccess: (result) => {
          setLoading(prev => { const next = { ...prev }; delete next[slotIdx]; return next })
          const next = [...imagesRef.current]
          next[slotIdx] = result.cdnUrl
          imagesRef.current = next
          onUpdate(next)
        },

        onError: (message) => {
          setLoading(prev => { const next = { ...prev }; delete next[slotIdx]; return next })
          // Remove the failed placeholder rather than leave a permanent
          // spinner — matches how removePhoto() already trims the array.
          const next = imagesRef.current.filter((_, idx) => idx !== slotIdx)
          imagesRef.current = next
          onUpdate(next)
          // eslint-disable-next-line no-console
          console.error(`Photo upload failed for "${title}": ${message}`)
        },

        onCancelled: () => {
          setLoading(prev => { const next = { ...prev }; delete next[slotIdx]; return next })
        },
      })
    })
  }

  // ── Remove handler ──────────────────────────────────────────────────────────
  function removePhoto(idx: number) {
    const next = imagesRef.current.filter((_, i) => i !== idx)
    imagesRef.current = next
    onUpdate(next)
    setLoading(prev => {
      const nextMap: LoadingMap = {}
      Object.keys(prev).forEach(k => {
        const ki = Number(k)
        if      (ki < idx) nextMap[ki]     = prev[ki]
        else if (ki > idx) nextMap[ki - 1] = prev[ki]
      })
      return nextMap
    })
  }

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────
  function onDragStart(idx: number) { dragFromIdx.current = idx }

  function onDragEnter(idx: number) {
    if (dragFromIdx.current === null || dragFromIdx.current === idx) return
    setDragOverIdx(idx)
  }

  function onDragEnd() { dragFromIdx.current = null; setDragOverIdx(null) }

  function onDrop(targetIdx: number) {
    const fromIdx = dragFromIdx.current
    if (fromIdx === null || fromIdx === targetIdx) {
      setDragOverIdx(null); dragFromIdx.current = null; return
    }
    const next = [...imagesRef.current]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(targetIdx, 0, moved)
    imagesRef.current = next
    onUpdate(next)
    dragFromIdx.current = null
    setDragOverIdx(null)
  }

  // ── Computed border / background colours ────────────────────────────────────
  const borderColor = isDone
    ? tokens.greenBorder
    : required ? tokens.amberBorder : tokens.border

  const headerBg = isDone
    ? tokens.greenLight
    : required ? tokens.amberLight : tokens.surface

  const countChipColor = isDone
    ? { bg: tokens.greenLight,  border: tokens.greenBorder,  text: tokens.greenText  }
    : count > 0
    ? { bg: tokens.amberLight,  border: tokens.amberBorder,  text: tokens.amberText  }
    : { bg: tokens.surface,     border: tokens.border,       text: tokens.text3      }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      border: `1.5px solid ${borderColor}`,
      borderRadius: tokens.radius.lg,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>

      {/* ── Block header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 18px',
        background: headerBg,
        borderBottom: `1px solid ${tokens.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: tokens.text }}>
              {title}
              {required && badge('Required')}
            </div>
            <div style={{ fontSize: 11, color: tokens.text3, marginTop: 2 }}>
              {subtitle ?? `Min ${minPhotos} · Max ${maxPhotos} photos · Drag to reorder · First = Main`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Photo count chip */}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: tokens.radius.full,
            background: countChipColor.bg, border: `1px solid ${countChipColor.border}`,
            color: countChipColor.text,
          }}>
            {count} / {maxPhotos}
          </span>

          {/* Done checkmark */}
          {isDone && (
            <span style={{ color: tokens.greenText, fontSize: 15, fontWeight: 700 }}>✓</span>
          )}

          {/* Remove button (optional categories only) */}
          {onRemove && (
            <button type="button" onClick={onRemove} style={{
              padding: '3px 10px', fontSize: 11, cursor: 'pointer',
              border: `1px solid ${tokens.redBorder}`, background: tokens.redLight,
              color: tokens.redText, borderRadius: 4, fontFamily: tokens.font.sans,
            }}>
              Remove
            </button>
          )}
        </div>
      </div>

      {/* ── Block body ── */}
      <div style={{ padding: '14px 18px' }}>

        {/* Hidden file input — triggered by click on empty state or + slot */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={e => handleFileInput(e.target.files)}
        />

        {count > 0 ? (
          /* ── Photo grid ── */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>

              {/* Existing photos */}
              {images.map((src, idx) => {
                const isLoading    = !!loadingMap[idx]
                const isDragTarget = dragOverIdx === idx
                const isMain       = idx === 0

                return (
                  <div
                    key={idx}
                    draggable={!isLoading}
                    onDragStart={() => onDragStart(idx)}
                    onDragEnter={() => onDragEnter(idx)}
                    onDragEnd={onDragEnd}
                    onDragOver={e => { e.preventDefault(); onDragEnter(idx) }}
                    onDrop={() => onDrop(idx)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: tokens.radius.sm,
                      overflow: 'hidden',
                      background: isLoading ? tokens.surface : '#000',
                      cursor: isLoading ? 'default' : 'grab',
                      border: isMain ? `2.5px solid ${accent}` : `1px solid ${tokens.border}`,
                      opacity: isDragTarget ? 0.65 : 1,
                      transition: 'opacity 0.15s, border-color 0.15s',
                    }}
                  >
                    {isLoading ? (
                      /* Loading spinner */
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          border: `2.5px solid ${tokens.border}`,
                          borderTopColor: accent,
                          animation: 'step8Spin 0.75s linear infinite',
                        }} />
                      </div>
                    ) : (
                      /* Photo */
                      <img
                        src={src}
                        alt={`${title} photo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}

                    {/* Main badge — first photo only */}
                    {isMain && !isLoading && (
                      <div style={{
                        position: 'absolute', top: 4, left: 4,
                        fontSize: 8, fontWeight: 800, color: '#fff',
                        background: accent, padding: '2px 6px', borderRadius: 3,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        Main
                      </div>
                    )}

                    {/* Remove button */}
                    {!isLoading && (
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        title="Remove photo"
                        style={{
                          position: 'absolute', top: 3, right: 3,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.65)', border: 'none',
                          color: '#fff', fontSize: 11, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: tokens.font.sans,
                        }}
                      >
                        ✕
                      </button>
                    )}

                    {/* Drag-over highlight */}
                    {isDragTarget && (
                      <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        border: `3px solid ${accent}`, borderRadius: tokens.radius.sm,
                        background: 'rgba(201,168,76,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, color: tokens.goldText,
                          background: tokens.goldLight, padding: '2px 8px', borderRadius: 4,
                        }}>
                          {idx === 0 ? 'Set as Main' : 'Drop here'}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add-more slot (hidden when full) */}
              {!isFull && (
                <label
                  title={`Add more photos for ${title}`}
                  style={{
                    aspectRatio: '1', borderRadius: tokens.radius.sm,
                    border: `2px dashed ${tokens.border}`, background: tokens.surface,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 4, cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = tokens.border)}
                >
                  <span style={{ fontSize: 22, color: tokens.text3, lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: 9, color: tokens.text3, textAlign: 'center', lineHeight: 1.3 }}>
                    Add photo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    onChange={e => handleFileInput(e.target.files)}
                  />
                </label>
              )}
            </div>

            {/* Shortfall hint */}
            {!isDone && count > 0 && (
              <p style={{ fontSize: 11, color: tokens.amberText, margin: '8px 0 0' }}>
                Add {shortfall} more photo{shortfall !== 1 ? 's' : ''} to complete this section.
              </p>
            )}

            {/* Drag hint */}
            <p style={{ fontSize: 11, color: tokens.text3, margin: '5px 0 0' }}>
              Drag photos to reorder. First photo is set as the Main display photo.
            </p>
          </>
        ) : (
          /* ── Empty state — click to upload ── */
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            style={{
              padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
              border: `2px dashed ${tokens.border}`, borderRadius: tokens.radius.md,
              color: tokens.text3, fontSize: 13, transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = accent
              e.currentTarget.style.background   = tokens.surface
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = tokens.border
              e.currentTarget.style.background   = 'transparent'
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Click to upload photos for {title}
            </div>
            <div style={{ fontSize: 11, color: tokens.text3 }}>
              JPG · PNG · WEBP · Max {MAX_FILE_MB} MB per file · Multiple files at once
            </div>
            {required && (
              <div style={{ fontSize: 11, color: tokens.amberText, marginTop: 6, fontWeight: 600 }}>
                Minimum {minPhotos} photo{minPhotos !== 1 ? 's' : ''} required
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: AgreementAccordion
// Collapsible policy section with full text and a checkbox to accept.
// ─────────────────────────────────────────────────────────────────────────────

interface AgreementAccordionProps {
  agreement: Agreement
  checked:   boolean
  onChange:  (v: boolean) => void
}

function AgreementAccordion({ agreement, checked, onChange }: AgreementAccordionProps) {

  const [isOpen, setIsOpen] = useState(false)

  const { emoji, title, label, content } = agreement

  const headerBg     = checked ? tokens.greenLight : tokens.surface
  const borderColor  = checked ? tokens.greenBorder : tokens.border
  const checkboxBg   = checked ? tokens.greenLight  : tokens.amberLight
  const checkboxBdr  = checked ? tokens.greenBorder : tokens.amberBorder
  const checkboxText = checked ? tokens.greenText   : tokens.amberText

  return (
    <div style={{
      border: `1.5px solid ${borderColor}`,
      borderRadius: tokens.radius.md,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>

      {/* ── Accordion header — click to expand / collapse ── */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', background: headerBg,
          border: 'none', cursor: 'pointer', fontFamily: tokens.font.sans,
          textAlign: 'left', transition: 'background 0.2s',
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{title}</div>
          <div style={{ fontSize: 11, color: tokens.text3, marginTop: 2 }}>
            {isOpen ? 'Click to collapse ▲' : 'Click to read full policy ▼'}
          </div>
        </div>

        {/* Accepted checkmark */}
        {checked && (
          <span style={{ fontSize: 18, fontWeight: 800, color: tokens.greenText, flexShrink: 0 }}>
            ✓
          </span>
        )}
      </button>

      {/* ── Policy text (visible when open) ── */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${tokens.border}`, background: '#FAFAF9' }}>
          <div style={{
            margin: '14px 18px 0',
            maxHeight: 300,
            overflowY: 'auto',
            padding: '14px 16px',
            background: tokens.white,
            border: `1px solid ${tokens.border}`,
            borderRadius: tokens.radius.sm,
            fontSize: 12, color: tokens.text2, lineHeight: 1.85,
            whiteSpace: 'pre-line', fontFamily: 'inherit',
          }}>
            {content}
          </div>

          {/* Checkbox to accept (inside open panel) */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            margin: '14px 18px 16px',
            padding: '12px 16px', cursor: 'pointer',
            background: checkboxBg, border: `1px solid ${checkboxBdr}`,
            borderRadius: tokens.radius.sm, transition: 'all 0.15s',
          }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => onChange(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer', accentColor: tokens.gold, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: checkboxText, lineHeight: 1.55 }}>
              {label}
            </span>
          </label>
        </div>
      )}

      {/* ── Compact checkbox row (visible when collapsed) ── */}
      {!isOpen && (
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${tokens.border}`, background: tokens.white }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => {
                onChange(e.target.checked)
                // If unchecking, open the panel so the user re-reads before re-checking.
                if (!e.target.checked) setIsOpen(true)
                // If checking without having read, open the panel first.
                if (e.target.checked && !isOpen) setIsOpen(true)
              }}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: tokens.gold, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: tokens.text2, lineHeight: 1.5 }}>
              {label}
              {!checked && (
                <span style={{ color: tokens.amberText, marginLeft: 6, fontSize: 11 }}>
                  — Expand above to read the full policy first.
                </span>
              )}
            </span>
          </label>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: WizardStep8
// ─────────────────────────────────────────────────────────────────────────────

export default function WizardStep8({ data, set, propertyId }: Props) {

  // ──────────────────────────────────────────────────────────────────────────
  // A. PROPERTY PHOTO HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  /** Keys of optional property categories currently toggled on */
  const activeOptionalCatKeys = data.photo_categories
    .map(c => c.category)
    .filter(k => OPTIONAL_PROP_CATS.some(o => o.key === k))

  function getPropertyCatImages(key: string): string[] {
    return data.photo_categories.find(c => c.category === key)?.images ?? []
  }

  function updatePropertyCatImages(key: string, label: string, images: string[]) {
    const without = data.photo_categories.filter(c => c.category !== key)
    set('photo_categories', images.length > 0 ? [...without, { category: key, label, images }] : without)
  }

  function toggleOptionalPropertyCat(key: string, label: string) {
    if (activeOptionalCatKeys.includes(key)) {
      // Remove the category and its photos
      set('photo_categories', data.photo_categories.filter(c => c.category !== key))
    } else {
      // Enable the category (empty; user uploads after toggling)
      set('photo_categories', [...data.photo_categories, { category: key, label, images: [] }])
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // B. ROOM PHOTO HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  function getRoomImages(roomIndex: number): string[] {
    return data.room_types[roomIndex]?.images ?? []
  }

  function updateRoomImages(roomIndex: number, images: string[]) {
    set('room_types', data.room_types.map((rt, i) =>
      i === roomIndex ? { ...rt, images } : rt
    ))
  }

  // ──────────────────────────────────────────────────────────────────────────
  // C. AGREEMENT HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  function setAgreement(key: AgreementKey, value: boolean) {
    set('agreements', { ...data.agreements, [key]: value })
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DERIVED PROGRESS STATE
  // ──────────────────────────────────────────────────────────────────────────

  const requiredPropCatsDone = REQUIRED_PROP_CATS.filter(
    c => getPropertyCatImages(c.key).length >= MIN_PROPERTY_CAT
  ).length

  const allRequiredPropCatsDone = requiredPropCatsDone === REQUIRED_PROP_CATS.length

  const totalPropertyPhotos = data.photo_categories.reduce(
    (sum, c) => sum + c.images.filter(i => !i.startsWith('loading:')).length,
    0
  )

  const hasRooms         = data.room_types.length > 0
  const roomsWithPhotos  = data.room_types.filter(rt => (rt.images?.length ?? 0) >= MIN_ROOM_PHOTOS).length
  const allRoomsCovered  = !hasRooms || roomsWithPhotos === data.room_types.length
  const totalRoomPhotos  = data.room_types.reduce(
    (sum, rt) => sum + (rt.images ?? []).filter(i => !i.startsWith('loading:')).length,
    0
  )

  const { terms_accepted, cancellation_accepted, payment_accepted, legal_accepted } = data.agreements
  const allAgreementsAccepted = terms_accepted && cancellation_accepted && payment_accepted && legal_accepted
  const agreementsCheckedCount = [terms_accepted, cancellation_accepted, payment_accepted, legal_accepted].filter(Boolean).length

  const readyToSubmit = allRequiredPropCatsDone && allRoomsCovered && allAgreementsAccepted

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TOP — OVERALL PROGRESS SUMMARY BANNER                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
        border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.md,
        overflow: 'hidden', background: tokens.border,
      }}>
        {[
          {
            label:  'Property Photos',
            value:  `${totalPropertyPhotos} photos`,
            status: `${requiredPropCatsDone}/${REQUIRED_PROP_CATS.length} required sections`,
            done:   allRequiredPropCatsDone,
          },
          {
            label:  'Room Photos',
            value:  hasRooms ? `${totalRoomPhotos} photos` : 'No rooms yet',
            status: hasRooms ? `${roomsWithPhotos}/${data.room_types.length} rooms covered` : 'Go back to Step 6',
            done:   allRoomsCovered,
          },
          {
            label:  'Agreements',
            value:  `${agreementsCheckedCount} / ${AGREEMENTS.length} accepted`,
            status: allAgreementsAccepted ? 'All accepted — ready to submit' : 'All required before submit',
            done:   allAgreementsAccepted,
          },
        ].map(({ label, value, status, done }) => (
          <div key={label} style={{
            padding: '14px 16px',
            background: done ? tokens.greenLight : tokens.surface,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: done ? tokens.greenText : tokens.text }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: done ? tokens.greenText : tokens.text3 }}>
              {status}
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION A — PROPERTY PHOTOS                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div>
        {sectionLabel('🏨', 'Section A — Property Photos', 'general property areas: exterior, lobby, amenities')}

        {/* Optional category toggles */}
        <div style={{ border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.lg, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '13px 18px', background: tokens.surface, borderBottom: `1px solid ${tokens.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>Optional Photo Areas</div>
            <div style={{ fontSize: 12, color: tokens.text2, marginTop: 2 }}>
              Enable the areas that exist at your property. Toggle to add or remove.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: tokens.border }}>
            {OPTIONAL_PROP_CATS.map(cat => {
              const isActive = activeOptionalCatKeys.includes(cat.key)
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => toggleOptionalPropertyCat(cat.key, cat.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px',
                    background: isActive ? tokens.goldLight : tokens.white,
                    border: 'none', cursor: 'pointer', fontFamily: tokens.font.sans,
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? tokens.goldText : tokens.text2 }}>
                    {cat.label}
                  </span>
                  <span style={{
                    marginLeft: 'auto', flexShrink: 0,
                    width: 18, height: 18, borderRadius: '50%',
                    background: isActive ? tokens.gold : tokens.surface,
                    border: `1px solid ${isActive ? tokens.gold : tokens.border}`,
                    color: isActive ? '#fff' : tokens.text3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {isActive ? '✓' : '+'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Required property categories */}
        <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Required
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REQUIRED_PROP_CATS.map(cat => (
            <PhotoUploadBlock
              key={cat.key}
              title={cat.label}
              emoji={cat.emoji}
              images={getPropertyCatImages(cat.key)}
              minPhotos={MIN_PROPERTY_CAT}
              maxPhotos={MAX_PROPERTY_CAT}
              required
              category={cat.key}
              propertyId={propertyId}
              onUpdate={imgs => updatePropertyCatImages(cat.key, cat.label, imgs)}
            />
          ))}
        </div>

        {/* Active optional property categories */}
        {activeOptionalCatKeys.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '18px 0 10px' }}>
              Optional
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {OPTIONAL_PROP_CATS
                .filter(cat => activeOptionalCatKeys.includes(cat.key))
                .map(cat => (
                  <PhotoUploadBlock
                    key={cat.key}
                    title={cat.label}
                    emoji={cat.emoji}
                    images={getPropertyCatImages(cat.key)}
                    minPhotos={MIN_PROPERTY_CAT}
                    maxPhotos={MAX_PROPERTY_CAT}
                    category={cat.key}
                    propertyId={propertyId}
                    onUpdate={imgs => updatePropertyCatImages(cat.key, cat.label, imgs)}
                    onRemove={() => toggleOptionalPropertyCat(cat.key, cat.label)}
                  />
                ))}
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION B — ROOM PHOTOS                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div>
        {sectionLabel('🛏️', 'Section B — Room Photos', 'shown on each room card when guests browse your hotel')}

        {!hasRooms ? (
          <div style={{
            padding: '28px', textAlign: 'center',
            border: `2px dashed ${tokens.border}`, borderRadius: tokens.radius.md,
            color: tokens.text3, fontSize: 13,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🛏️</div>
            No room types added yet.
            <div style={{ fontSize: 12, marginTop: 4 }}>Go back to Step 6 to add room types, then return here to upload their photos.</div>
          </div>
        ) : (
          <>
            {infoBanner(
              <>
                <strong>Important:</strong> Upload at least 1 photo per room type.
                These photos appear directly on the room card when a guest is deciding which room to book —
                they are the single biggest factor in room-level conversion.
                Add {MIN_ROOM_PHOTOS}–{MAX_ROOM_PHOTOS} high-quality photos per room.
              </>,
              'amber'
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.room_types.map((room, roomIdx) => (
                <PhotoUploadBlock
                  key={roomIdx}
                  title={room.name || `Room ${roomIdx + 1}`}
                  emoji="🛏️"
                  subtitle={[
                    room.bed_type && `${room.bed_type} bed`,
                    room.max_occupancy && `Max ${room.max_occupancy} guests`,
                    room.size_sqft   && `${room.size_sqft} sq ft`,
                    room.rate_plans.website.room.ep && `₹${room.rate_plans.website.room.ep.toLocaleString('en-IN')}/night`,
                    `Min ${MIN_ROOM_PHOTOS} photo required`,
                  ].filter(Boolean).join(' · ')}
                  images={getRoomImages(roomIdx)}
                  minPhotos={MIN_ROOM_PHOTOS}
                  maxPhotos={MAX_ROOM_PHOTOS}
                  required
                  accentColor={tokens.gold}
                  category="room"
                  propertyId={propertyId}
                  onUpdate={imgs => updateRoomImages(roomIdx, imgs)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION C — PARTNER AGREEMENTS                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div>
        {sectionLabel('📜', 'Section C — Partner Agreements', 'all four must be accepted to unlock Submit')}

        {infoBanner(
          allAgreementsAccepted
            ? '✓ All four agreements accepted. The Submit button is now unlocked.'
            : `Please read and accept all ${AGREEMENTS.length} agreements below. The Submit button will unlock once every box is checked.`,
          allAgreementsAccepted ? 'green' : 'amber'
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AGREEMENTS.map(ag => (
            <AgreementAccordion
              key={ag.key}
              agreement={ag}
              checked={data.agreements[ag.key]}
              onChange={v => setAgreement(ag.key, v)}
            />
          ))}
        </div>

        {/* ── Submit readiness checklist ── */}
        <div style={{
          marginTop: 24,
          padding: '18px 20px',
          border: `2px solid ${readyToSubmit ? tokens.greenBorder : tokens.border}`,
          borderRadius: tokens.radius.md,
          background: readyToSubmit ? tokens.greenLight : tokens.surface,
          transition: 'all 0.25s',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 12 }}>
            {readyToSubmit ? '✅ All good — you\'re ready to submit.' : '⏳ Complete the checklist below to unlock Submit.'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {([
              {
                done:  allRequiredPropCatsDone,
                label: `Property photos — ${requiredPropCatsDone} / ${REQUIRED_PROP_CATS.length} required categories complete`,
              },
              {
                done:  allRoomsCovered,
                label: hasRooms
                  ? `Room photos — ${roomsWithPhotos} / ${data.room_types.length} room types have photos`
                  : 'Room photos — No rooms added (go back to Step 6)',
              },
              { done: terms_accepted,        label: 'Terms & Conditions accepted' },
              { done: cancellation_accepted,  label: 'Cancellation Policy accepted' },
              { done: payment_accepted,       label: 'Payment & Payout Terms accepted' },
              { done: legal_accepted,         label: 'Legal Declarations accepted' },
            ] as { done: boolean; label: string }[]).map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
                  color: item.done ? tokens.greenText : tokens.text2,
                  fontWeight: item.done ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>
                  {item.done ? '✓' : '○'}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe for loading spinner */}
      <style>{`@keyframes step8Spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}