import { Chip, EmptyState, SectionLabel } from '../../kit/primitives'
import type { Artifact } from '../../engine/types'

export function ArtifactLedger({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <div className="space-y-3">
      <SectionLabel>Artifact ledger</SectionLabel>
      {artifacts.length === 0 ? (
        <EmptyState>No artifacts yet.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {artifacts.map((a) => (
            <li key={a.id} className="border border-[var(--color-hairline)] bg-[var(--color-bg)] px-2 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Chip>{a.kind}</Chip>
                <span className="text-[12px] text-[var(--color-text)]">{a.title}</span>
              </div>
              {a.preview && (
                <p className="mt-1.5 text-[11px] whitespace-pre-wrap text-[var(--color-text-tertiary)]">
                  {a.preview}
                </p>
              )}
              <div className="mt-1.5 text-[10px] text-[var(--color-text-tertiary)]">
                {a.stepId && <span>step {a.stepId}</span>}
                {a.stepId && a.toolCallId && <span> · </span>}
                {a.toolCallId && <span>tool {a.toolCallId}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
