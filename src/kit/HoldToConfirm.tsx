import { useRef, type CSSProperties } from 'react'

export function HoldToConfirm({
  label,
  onConfirm,
  holdMs = 900,
  className = '',
}: {
  label: string
  onConfirm: () => void
  holdMs?: number
  className?: string
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const start = useRef(0)
  const elRef = useRef<HTMLButtonElement | null>(null)

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    elRef.current?.style.setProperty('--hold', '0%')
  }

  const tick = () => {
    const el = elRef.current
    if (!el) return
    const p = Math.min(100, ((Date.now() - start.current) / holdMs) * 100)
    el.style.setProperty('--hold', `${p}%`)
    if (p < 100) {
      timer.current = setTimeout(tick, 16)
    } else {
      onConfirm()
      clear()
    }
  }

  return (
    <button
      ref={elRef}
      type="button"
      className={`relative overflow-hidden border border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)] px-3 py-2 text-[12px] text-[var(--color-danger)] select-none ${className}`}
      style={{ '--hold': '0%' } as CSSProperties}
      onPointerDown={() => {
        start.current = Date.now()
        elRef.current?.style.setProperty('--hold', '0%')
        timer.current = setTimeout(tick, 16)
      }}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-[var(--color-danger)]/25"
        style={{ width: 'var(--hold)' }}
        aria-hidden
      />
      <span className="relative">{label}</span>
    </button>
  )
}
