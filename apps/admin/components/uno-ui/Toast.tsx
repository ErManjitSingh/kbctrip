'use client'

import { useEffect, useState } from 'react'
import { tokens }              from '@/lib/tokens'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message:   string
  type?:     ToastType
  onDismiss: () => void
}

export default function Toast({ message, type = 'success', onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  const configs = {
    success: { bg: tokens.green,  icon: '✓', label: 'Success' },
    error:   { bg: tokens.red,    icon: '✕', label: 'Error'   },
    info:    { bg: tokens.blue,   icon: 'ℹ', label: 'Info'    },
  }
  const cfg = configs[type]

  return (
    <div
      onClick={onDismiss}
      style={{
        position:  'fixed',
        bottom:    28,
        right:     28,
        zIndex:    9999,
        background: cfg.bg,
        color:     '#fff',
        padding:   '12px 18px',
        borderRadius: tokens.radius.md,
        fontSize:  13,
        fontWeight: 500,
        fontFamily: tokens.font.sans,
        maxWidth:  360,
        minWidth:  240,
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.25s, transform 0.25s',
        cursor:    'pointer',
        display:   'flex',
        alignItems: 'center',
        gap:       10,
        boxShadow: tokens.shadow.lg,
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        {cfg.icon}
      </span>
      {message}
    </div>
  )
}