import { Chip, StatusDot } from '../../kit/primitives'
import type { SessionMeta } from '../../engine/types'

const triageTone: Record<SessionMeta['triage'], 'danger' | 'accent' | 'success' | 'default'> = {
  needs_you: 'danger',
  running: 'accent',
  done: 'success',
  idle: 'default',
}

const triageLabel: Record<SessionMeta['triage'], string> = {
  needs_you: 'needs you',
  running: 'running',
  done: 'done',
  idle: 'idle',
}

export function FleetTriage({
  sessions,
  activeId,
  onSelect,
}: {
  sessions: SessionMeta[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ul className="space-y-1">
      {sessions.map((s) => {
        const active = s.id === activeId
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`flex w-full flex-col gap-1 border px-2 py-2 text-left transition-colors ${
                active
                  ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent-dim)]'
                  : 'border-transparent hover:border-[var(--color-hairline)] hover:bg-[var(--color-surface-raised)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusDot
                  status={
                    s.triage === 'needs_you'
                      ? 'needs_you'
                      : s.triage === 'running'
                        ? 'running'
                        : s.triage === 'done'
                          ? 'done'
                          : 'idle'
                  }
                  pulse={s.triage === 'running' || s.triage === 'needs_you'}
                />
                <span className="truncate text-[12px] text-[var(--color-text)]">{s.taskTitle}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pl-3.5">
                <span className="text-[10px] text-[var(--color-text-tertiary)]">{s.agentName}</span>
                <Chip tone={triageTone[s.triage]}>{triageLabel[s.triage]}</Chip>
                <span className="tabular text-[10px] text-[var(--color-text-tertiary)]">
                  ${s.costUsd.toFixed(2)}
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
