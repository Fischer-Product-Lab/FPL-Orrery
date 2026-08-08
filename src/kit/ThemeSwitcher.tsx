import { useEffect, useRef, useState } from 'react'
import { useThemeStore } from './theme'
import { getTheme, themes } from './themes'
import { Chip, Keycap } from './primitives'

function SwatchTrio({
  bg,
  accent,
  text,
  size = 8,
}: {
  bg: string
  accent: string
  text: string
  size?: number
}) {
  const dot = (color: string) => (
    <span
      className="inline-block rounded-full border border-[var(--color-hairline)]"
      style={{ width: size, height: size, background: color }}
    />
  )
  return (
    <span className="inline-flex items-center gap-0.5">
      {dot(bg)}
      {dot(accent)}
      {dot(text)}
    </span>
  )
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const themeId = useThemeStore((s) => s.themeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const current = getTheme(themeId)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${current.name}`}
        className={`sheen glint inline-flex items-center gap-2 border border-[var(--color-hairline)] bg-[var(--color-surface)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)] ${
          compact ? '!px-1.5' : ''
        }`}
      >
        <SwatchTrio
          bg={current.tokens['--color-bg']}
          accent={current.tokens['--color-accent']}
          text={current.tokens['--color-text']}
        />
        {!compact && <span className="max-w-[7rem] truncate">{current.name}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Themes"
          className="absolute right-0 top-full z-50 mt-1 w-64 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] py-1"
        >
          {themes.map((t) => {
            const active = t.id === themeId
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setTheme(t.id)
                  setOpen(false)
                }}
                className={`glint flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors ${
                  active
                    ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                <SwatchTrio
                  bg={t.tokens['--color-bg']}
                  accent={t.tokens['--color-accent']}
                  text={t.tokens['--color-text']}
                  size={10}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{t.name}</span>
                  <span className="block truncate text-[10px] text-[var(--color-text-tertiary)]">
                    {t.tagline}
                  </span>
                </span>
                <Chip tone={t.isDark ? 'default' : 'accent'}>
                  {t.isDark ? 'dark' : 'light'}
                </Chip>
              </button>
            )
          })}
          <div className="border-t border-[var(--color-hairline)] px-3 py-2 text-[10px] text-[var(--color-text-tertiary)]">
            press <Keycap>t</Keycap> to cycle
          </div>
        </div>
      )}
    </div>
  )
}
