import React from 'react'

const S = {
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    borderRadius: 8, transition: 'all 0.15s',
    whiteSpace: 'nowrap', textDecoration: 'none',
    padding: '8px 16px', fontSize: 13,
  },
}

const variantStyle = {
  primary: { background: 'var(--accent)', color: '#fff' },
  ghost: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' },
  danger: { background: 'rgba(240,106,106,0.12)', color: 'var(--red)', border: '1px solid rgba(240,106,106,0.25)' },
  success: { background: 'rgba(82,214,138,0.12)', color: 'var(--green)', border: '1px solid rgba(82,214,138,0.25)' },
}

const sizeStyle = {
  sm: { padding: '5px 10px', fontSize: 12 },
  md: { padding: '8px 16px', fontSize: 13 },
  lg: { padding: '11px 22px', fontSize: 14 },
}

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', size = 'md', children, style, className = '', ...props }) {
  const [hovered, setHovered] = React.useState(false)
  const hoverStyle = hovered && !props.disabled
    ? variant === 'primary' ? { opacity: 0.85, transform: 'translateY(-1px)' }
    : variant === 'ghost' ? { background: 'var(--surface2)', color: 'var(--text)' }
    : variant === 'danger' ? { background: 'rgba(240,106,106,0.22)' }
    : {}
    : {}

  return (
    <button
      style={{ ...S.btn, ...variantStyle[variant], ...sizeStyle[size], ...hoverStyle, ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', style, onClick }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 28,
        width: '100%', maxWidth,
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.2s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(18px); opacity:0 } to { transform:translateY(0); opacity:1 } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '6px 8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────
const inputStyle = {
  fontFamily: "'DM Sans', sans-serif",
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text2)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  marginBottom: 6,
}

export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={{ ...inputStyle, ...(error ? { borderColor: 'var(--red)' } : {}), ...style }} {...props} />
      {error && <span style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</span>}
    </div>
  )
}

export function Textarea({ label, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, ...style }} {...props} />
    </div>
  )
}

export function Select({ label, children, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select style={{ ...inputStyle, ...style }} {...props}>{children}</select>
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const badgeColors = {
  accent: { background: 'rgba(124,106,247,0.15)', color: 'var(--accent)' },
  green:  { background: 'rgba(82,214,138,0.15)',  color: 'var(--green)' },
  yellow: { background: 'rgba(245,197,66,0.15)',  color: 'var(--yellow)' },
  red:    { background: 'rgba(240,106,106,0.15)', color: 'var(--red)' },
  blue:   { background: 'rgba(91,156,246,0.15)',  color: 'var(--blue)' },
  gray:   { background: 'rgba(139,138,149,0.15)', color: 'var(--text2)' },
}

export function Badge({ children, color = 'accent', style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600,
      ...badgeColors[color],
      ...style,
    }}>
      {children}
    </span>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ height = 20, width = '100%', borderRadius = 8 }) {
  return (
    <div style={{
      height, width, borderRadius,
      background: 'var(--surface2)',
      animation: 'skPulse 1.4s ease-in-out infinite',
    }}>
      <style>{`@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

// ─── Progress ────────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, gradient = false }) {
  return (
    <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 99,
        transition: 'width 0.5s ease',
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: gradient ? 'linear-gradient(90deg, var(--accent), #a78bfa)' : 'var(--accent)',
      }} />
    </div>
  )
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
export function Tag({ children, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99,
      background: 'rgba(124,106,247,0.12)', color: 'var(--accent)',
      fontSize: 12, fontWeight: 500,
    }}>
      {children}
      {onRemove && (
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontSize: 14, lineHeight: 1, padding: 0, opacity: 0.7,
        }}>×</button>
      )}
    </span>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, message, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', textAlign: 'center', gap: 12,
    }}>
      {icon && <div style={{ fontSize: 42, opacity: 0.5 }}>{icon}</div>}
      <p style={{ fontSize: 14, color: 'var(--text2)' }}>{message}</p>
      {action}
    </div>
  )
}
