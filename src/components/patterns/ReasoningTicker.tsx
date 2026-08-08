import { useState } from 'react'
import { SectionLabel } from '../../kit/primitives'

export function ReasoningTicker({
  current,
  history,
  defaultExpanded = false,
}: {
  current: string
  history: { id: string; text: string }[]
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const line = current || history[history.length - 1]?.text || 'Awaiting reasoning…'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>Reasoning ticker</SectionLabel>
        <button
          type="button"
          className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'collapse' : 'expand'}
        </button>
      </div>
      {!expanded ? (
        <p className="thought truncate text-[13px] text-[var(--color-text-secondary)]">
          {line}
        </p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-2">
          {history.length === 0 ? (
            <p className="thought text-[13px] text-[var(--color-text-tertiary)]">No thoughts yet.</p>
          ) : (
            history.map((t) => (
              <p key={t.id} className="thought phosphor text-[13px] text-[var(--color-text-secondary)]">
                {t.text}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  )
}
