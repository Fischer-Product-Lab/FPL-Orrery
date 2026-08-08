import { Button, SectionLabel } from '../../kit/primitives'
import type { RecapDigest } from '../../engine/types'
import { formatVirtualTime } from '../../engine/store'

export function AwayRecap({
  recap,
  onDismiss,
}: {
  recap: RecapDigest
  onDismiss: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--color-bg)]/80 p-4">
      <div className="w-full max-w-lg border border-[var(--color-hairline-strong)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-hairline)] px-4 py-3">
          <SectionLabel>While you were away</SectionLabel>
          <h2 className="display mt-1 text-xl text-[var(--color-text)]">
            Recap at t+{formatVirtualTime(recap.generatedAt)}
          </h2>
        </div>
        <div className="grid gap-4 px-4 py-4 sm:grid-cols-3">
          <RecapCol title="Decided" items={recap.decided} />
          <RecapCol title="Produced" items={recap.produced} />
          <RecapCol title="Waiting on you" items={recap.waiting} accent />
        </div>
        <div className="border-t border-[var(--color-hairline)] px-4 py-3">
          <Button variant="primary" onClick={onDismiss}>
            Resume supervision
          </Button>
        </div>
      </div>
    </div>
  )
}

function RecapCol({
  title,
  items,
  accent,
}: {
  title: string
  items: string[]
  accent?: boolean
}) {
  return (
    <div>
      <div
        className={`mb-2 text-[10px] uppercase tracking-[0.14em] ${
          accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'
        }`}
      >
        {title}
      </div>
      <ul className="space-y-1.5 text-[11px] text-[var(--color-text-secondary)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
