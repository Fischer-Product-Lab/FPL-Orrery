import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
export { HoldToConfirm } from './HoldToConfirm'

export function Hairline({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`h-px w-full bg-[var(--color-hairline)] ${className}`}
      role="separator"
      {...props}
    />
  )
}

export function BoxFrame({
  children,
  title,
  className = '',
  bodyClassName = '',
}: {
  children: ReactNode
  title?: string
  className?: string
  bodyClassName?: string
}) {
  return (
    <div
      className={`border border-[var(--color-hairline)] bg-[var(--color-surface)] ${className}`}
    >
      {title ? (
        <>
          <div className="flex items-center gap-2 border-b border-[var(--color-hairline)] px-3 py-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              {title}
            </span>
          </div>
          <div className={bodyClassName}>{children}</div>
        </>
      ) : (
        <div className={bodyClassName}>{children}</div>
      )}
    </div>
  )
}

type ChipTone = 'default' | 'accent' | 'success' | 'danger' | 'warning'

const chipTone: Record<ChipTone, string> = {
  default: 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-hairline)]',
  accent: 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/30',
  success: 'bg-[var(--color-success-dim)] text-[var(--color-success)] border-[var(--color-success)]/30',
  danger: 'bg-[var(--color-danger-dim)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
  warning: 'bg-[var(--color-warning-dim)] text-[var(--color-warning)] border-[var(--color-warning)]/30',
}

export function Chip({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode
  tone?: ChipTone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] tracking-wide ${chipTone[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

type Status = 'idle' | 'running' | 'needs_you' | 'done' | 'blocked' | 'failed'

const statusDot: Record<Status, string> = {
  idle: 'bg-[var(--color-text-tertiary)]',
  running: 'bg-[var(--color-accent)]',
  needs_you: 'bg-[var(--color-danger)]',
  done: 'bg-[var(--color-success)]',
  blocked: 'bg-[var(--color-warning)]',
  failed: 'bg-[var(--color-danger)]',
}

export function StatusDot({
  status,
  pulse = false,
  className = '',
}: {
  status: Status
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-block size-1.5 shrink-0 rounded-full ${statusDot[status]} ${pulse ? 'animate-pulse' : ''} ${className}`}
      aria-hidden
    />
  )
}

export function Meter({
  value,
  max = 100,
  className = '',
  tone = 'accent',
}: {
  value: number
  max?: number
  className?: string
  tone?: 'accent' | 'success' | 'danger'
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const fill =
    tone === 'success'
      ? 'bg-[var(--color-success)]'
      : tone === 'danger'
        ? 'bg-[var(--color-danger)]'
        : 'bg-[var(--color-accent)]'
  return (
    <div
      className={`h-1 w-full bg-[var(--color-surface-raised)] ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Keycap({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.4em] items-center justify-center border border-[var(--color-hairline-strong)] bg-[var(--color-surface-raised)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
      {children}
    </kbd>
  )
}

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'outline'

const btnVariant: Record<BtnVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-bg)] hover:brightness-110 disabled:opacity-40',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]',
  danger:
    'bg-[var(--color-danger-dim)] text-[var(--color-danger)] border border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/20',
  outline:
    'bg-transparent border border-[var(--color-hairline-strong)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
}

export function Button({
  variant = 'outline',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] transition-colors duration-[var(--duration-fast)] disabled:cursor-not-allowed ${btnVariant[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function NavLink({
  className = '',
  active,
  end: _end,
  ...props
}: LinkProps & { active?: boolean; end?: boolean }) {
  void _end
  return (
    <Link
      className={`text-[12px] tracking-wide transition-colors duration-[var(--duration-fast)] ${
        active
          ? 'text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
      } ${className}`}
      {...props}
    />
  )
}

export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  return (
    <span className={`tabular ${className}`}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
      {children}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
      {children}
    </div>
  )
}
