import { Chip, SectionLabel, StatusDot } from '../../kit/primitives'
import type { PlanStep, PlanRevisedEvent } from '../../engine/types'

const statusLabel: Record<PlanStep['status'], string> = {
  pending: 'pending',
  active: 'active',
  done: 'done',
  skipped: 'skipped',
  blocked: 'blocked',
}

function stepStatus(status: PlanStep['status']): 'idle' | 'running' | 'done' | 'blocked' {
  if (status === 'active') return 'running'
  if (status === 'done') return 'done'
  if (status === 'blocked') return 'blocked'
  return 'idle'
}

export function PlanSpine({
  steps,
  revisionReason,
  diff,
  compact = false,
}: {
  steps: PlanStep[]
  revisionReason?: string
  diff?: PlanRevisedEvent['diff']
  compact?: boolean
}) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <SectionLabel>Plan spine</SectionLabel>
      {revisionReason && (
        <div className="border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] px-2 py-1.5 text-[11px]">
          <div className="mb-1 text-[var(--color-accent)]">Plan revised</div>
          <p className="text-[var(--color-text-secondary)]">{revisionReason}</p>
          {diff && (
            <ul className="mt-1.5 space-y-0.5 text-[10px] text-[var(--color-text-tertiary)]">
              {diff.added.map((d) => (
                <li key={`a-${d}`}>+ {d}</li>
              ))}
              {diff.removed.map((d) => (
                <li key={`r-${d}`} className="line-through">
                  − {d}
                </li>
              ))}
              {diff.changed.map((d) => (
                <li key={`c-${d}`}>~ {d}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <ol className="space-y-1">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className={`flex items-start gap-2 px-1 py-1 ${
              step.status === 'active' ? 'bg-[var(--color-accent-dim)]' : ''
            }`}
          >
            <span className="tabular text-[10px] text-[var(--color-text-tertiary)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <StatusDot
              status={stepStatus(step.status)}
              pulse={step.status === 'active'}
              className="mt-1.5"
            />
            <div className="min-w-0 flex-1">
              <div
                className={`text-[12px] ${
                  step.status === 'done'
                    ? 'text-[var(--color-text-tertiary)] line-through'
                    : step.status === 'active'
                      ? 'text-[var(--color-text)]'
                      : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {step.label}
              </div>
              {!compact && (
                <Chip
                  tone={
                    step.status === 'active'
                      ? 'accent'
                      : step.status === 'done'
                        ? 'success'
                        : 'default'
                  }
                  className="mt-1"
                >
                  {statusLabel[step.status]}
                </Chip>
              )}
            </div>
          </li>
        ))}
      </ol>
      {steps.length === 0 && (
        <p className="text-[11px] text-[var(--color-text-tertiary)]">No plan yet.</p>
      )}
    </div>
  )
}
