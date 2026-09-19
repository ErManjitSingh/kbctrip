'use client'
// src/app/cabs/page.tsx
// Admin Cab Manager — same layout as ops, + Approve/Activate toggle

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import { tokens }              from '@/lib/tokens'
import { cabTypesApi }         from '@/lib/cabs-admin-store'
import Toast                   from '@/components/uno-ui/Toast'
import type { AdminCab }        from '@/lib/cabs-admin-store'

const CATEGORY_LABELS: Record<string, string> = {
  sedan: 'Sedan', suv: 'SUV', muv: 'MUV',
  tempo_traveller: 'Tempo Traveller', mini_bus: 'Mini Bus', luxury: 'Luxury',
}

const inp: React.CSSProperties = {
  height: 36, padding: '0 10px', fontSize: 13,
  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.md,
  background: tokens.white, fontFamily: tokens.font.sans,
  color: tokens.text, outline: 'none',
}

export default function AdminCabsPage() {
  const router = useRouter()
  const [items,   setItems]   = useState<AdminCab[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [catFilter, setCat]   = useState('')
  const [toast,   setToast]   = useState<{ message: string; type?: 'success'|'error' }|null>(null)
  const limit = 20

  async function load(p = 1, q = search, cat = catFilter) {
    setLoading(true)
    try {
      const data = await cabTypesApi.list({
        page: p, limit,
        search: q || undefined,
        cab_category: cat || undefined,
      })
      setItems(data.items)
      setTotal(data.total)
    } catch (e: any) {
      setToast({ message: e?.message ?? 'Failed to load cabs', type: 'error' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load(page) }, [page])

  function handleSearch() { setPage(1); load(1, search, catFilter) }

  async function handleToggle(cab: AdminCab) {
    try {
      await cabTypesApi.update(cab.id, { is_active: !cab.is_active })
      setToast({ message: `"${cab.name}" ${!cab.is_active ? 'activated' : 'deactivated'}`, type: 'success' })
      load(page)
    } catch (e: any) {
      setToast({ message: e?.message ?? 'Update failed', type: 'error' })
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await cabTypesApi.delete(id)
      setToast({ message: 'Cab deleted', type: 'success' })
      load(page)
    } catch (e: any) {
      setToast({ message: e?.message ?? 'Delete failed', type: 'error' })
    }
  }

  const totalPages = Math.ceil(total / limit)

  const thSt: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: tokens.text3,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '10px 14px', textAlign: 'left',
    borderBottom: `1px solid ${tokens.border}`, whiteSpace: 'nowrap',
    background: tokens.surface,
  }
  const tdSt: React.CSSProperties = {
    padding: '12px 14px', fontSize: 13, color: tokens.text,
    borderBottom: `1px solid ${tokens.border}`, verticalAlign: 'middle',
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
        <span style={{ fontSize: 12, color: tokens.text3 }}>Cab Manager</span>
        <span style={{ color: tokens.border }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>All Cabs</span>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text }}>Cabs</div>
            <div style={{ fontSize: 12, color: tokens.text3, marginTop: 2 }}>
              {total} total · approve and activate cabs submitted by ops team
            </div>
          </div>
          <button
            onClick={() => router.push('/cabs/new')}
            style={{
              padding: '9px 18px', fontSize: 13, fontWeight: 700,
              borderRadius: tokens.radius.md, border: 'none',
              background: tokens.orange, color: '#fff',
              cursor: 'pointer', fontFamily: tokens.font.sans,
            }}
          >
            + Add Cab
          </button>
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap',
          background: tokens.white, border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius.lg, padding: '12px 16px',
          boxShadow: tokens.shadow.sm,
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search cab name…"
            style={{ ...inp, width: 220 }}
            onFocus={e => (e.currentTarget.style.borderColor = tokens.orange)}
            onBlur={e  => (e.currentTarget.style.borderColor = tokens.border)}
          />
          <select
            value={catFilter}
            onChange={e => { setCat(e.target.value); setPage(1); load(1, search, e.target.value) }}
            style={{ ...inp, paddingRight: 8, cursor: 'pointer' }}
            onFocus={e => (e.currentTarget.style.borderColor = tokens.orange)}
            onBlur={e  => (e.currentTarget.style.borderColor = tokens.border)}
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button
            onClick={handleSearch}
            style={{
              padding: '0 16px', height: 36, fontSize: 12, fontWeight: 700,
              borderRadius: tokens.radius.md, border: `1px solid ${tokens.orange}`,
              background: tokens.orangeLight, color: tokens.orangeText,
              cursor: 'pointer', fontFamily: tokens.font.sans,
            }}
          >
            Search
          </button>
          {(search || catFilter) && (
            <button
              onClick={() => { setSearch(''); setCat(''); setPage(1); load(1, '', '') }}
              style={{
                padding: '0 14px', height: 36, fontSize: 12, fontWeight: 600,
                borderRadius: tokens.radius.md, border: `1px solid ${tokens.border}`,
                background: 'transparent', color: tokens.text2,
                cursor: 'pointer', fontFamily: tokens.font.sans,
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{
          background: tokens.white, border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.sm,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thSt}></th>
                <th style={thSt}>Name</th>
                <th style={thSt}>Category</th>
                <th style={thSt}>Seats</th>
                <th style={thSt}>Driver</th>
                <th style={thSt}>Base City</th>
                <th style={thSt}>Status</th>
                <th style={thSt}>Added</th>
                <th style={{ ...thSt, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ ...tdSt, textAlign: 'center', padding: 48, color: tokens.text3 }}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ ...tdSt, textAlign: 'center', padding: 48 }}>
                    <div style={{ color: tokens.text3, fontSize: 13 }}>No cabs found</div>
                  </td>
                </tr>
              ) : (
                items.map(c => {
                  const cAny = c as any
                  return (
                    <tr key={c.id} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.surface)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Thumb */}
                      <td style={{ ...tdSt, width: 52, padding: '8px 10px' }}>
                        {cAny.featured_image ? (
                          <img src={cAny.featured_image} alt=""
                            style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 4, border: `1px solid ${tokens.border}` }} />
                        ) : (
                          <div style={{ width: 40, height: 30, borderRadius: 4, background: tokens.surface, border: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚗</div>
                        )}
                      </td>

                      {/* Name */}
                      <td style={tdSt}>
                        <div style={{ fontWeight: 700, color: tokens.text }}>{c.name}</div>
                        {c.slug && <div style={{ fontSize: 11, color: tokens.text3, fontFamily: tokens.font.mono }}>/{c.slug}</div>}
                      </td>

                      {/* Category */}
                      <td style={tdSt}>
                        <span style={{
                          display: 'inline-block', padding: '3px 9px',
                          borderRadius: tokens.radius.full, fontSize: 11, fontWeight: 700,
                          background: tokens.orangeLight, border: `1px solid ${tokens.orangeBorder}`,
                          color: tokens.orangeText,
                        }}>
                          {CATEGORY_LABELS[c.cab_category] || c.cab_category}
                        </span>
                      </td>

                      {/* Seats */}
                      <td style={{ ...tdSt, color: tokens.text2 }}>{c.seating_capacity}</td>

                      {/* Driver */}
                      <td style={tdSt}>
                        {cAny.driver_name ? (
                          <>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{cAny.driver_name}</div>
                            {cAny.registration_number && (
                              <div style={{ fontSize: 11, color: tokens.text3, fontFamily: tokens.font.mono }}>{cAny.registration_number}</div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: tokens.text3, fontSize: 12, fontStyle: 'italic' }}>—</span>
                        )}
                      </td>

                      {/* Base city */}
                      <td style={{ ...tdSt, color: tokens.text2 }}>{cAny.base_city || '—'}</td>

                      {/* Status */}
                      <td style={tdSt}>
                        <span style={{
                          display: 'inline-block', padding: '3px 9px',
                          borderRadius: tokens.radius.full, fontSize: 11, fontWeight: 700,
                          background: c.is_active ? tokens.greenLight : '#F3F4F6',
                          border: `1px solid ${c.is_active ? tokens.greenBorder : '#D1D5DB'}`,
                          color: c.is_active ? tokens.greenText : '#6B7280',
                        }}>
                          {c.is_active ? 'Active' : 'Pending'}
                        </span>
                      </td>

                      {/* Added */}
                      <td style={{ ...tdSt, color: tokens.text3, fontSize: 12 }}>
                        {new Date(cAny.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdSt, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {/* Approve/Deactivate toggle */}
                          <button
                            title={c.is_active ? 'Deactivate' : 'Approve & Activate'}
                            onClick={() => handleToggle(c)}
                            style={{
                              padding: '5px 10px', fontSize: 11, fontWeight: 700,
                              borderRadius: tokens.radius.sm, cursor: 'pointer',
                              fontFamily: tokens.font.sans,
                              border: `1px solid ${c.is_active ? tokens.border : tokens.greenBorder}`,
                              background: c.is_active ? tokens.white : tokens.greenLight,
                              color: c.is_active ? tokens.text2 : tokens.greenText,
                            }}
                          >
                            {c.is_active ? '⏸ Deactivate' : '✓ Approve'}
                          </button>
                          {/* Edit (opens SEO + full edit) */}
                          <button
                            onClick={() => router.push(`/cabs/${c.id}`)}
                            style={{
                              padding: '5px 10px', fontSize: 11, fontWeight: 700,
                              borderRadius: tokens.radius.sm, cursor: 'pointer',
                              border: `1px solid ${tokens.border}`, background: tokens.white,
                              color: tokens.text2, fontFamily: tokens.font.sans,
                            }}
                          >
                            Edit
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            style={{
                              padding: '5px 10px', fontSize: 11, fontWeight: 700,
                              borderRadius: tokens.radius.sm, cursor: 'pointer',
                              border: `1px solid ${tokens.redBorder}`, background: tokens.redLight,
                              color: tokens.redText, fontFamily: tokens.font.sans,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8,
              padding: '12px 18px', borderTop: `1px solid ${tokens.border}`,
            }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '5px 12px', fontSize: 12, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.border}`, background: tokens.white, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >← Prev</button>
              <span style={{ fontSize: 12, color: tokens.text3, alignSelf: 'center' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '5px 12px', fontSize: 12, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.border}`, background: tokens.white, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
              >Next →</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}