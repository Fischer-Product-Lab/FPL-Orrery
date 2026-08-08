import { ApprovalGate } from './patterns/ApprovalGate'
import { ToolCard } from './patterns/ToolCard'
import { MemoryMoment, SkillMoment } from './patterns/MemorySkill'
import { Chip } from '../kit/primitives'
import type { FeedItem } from '../engine/types'
import { formatVirtualTime } from '../engine/store'

export function FeedStream({
  feed,
  selectedIndex,
  onSelect,
  onResolveApproval,
  onCorrectMemory,
  onResolveSkill,
}: {
  feed: FeedItem[]
  selectedIndex?: number
  onSelect?: (index: number) => void
  onResolveApproval: (approvalId: string, decision: 'approved' | 'rejected') => void
  onCorrectMemory: (memoryId: string) => void
  onResolveSkill: (skillId: string, accepted: boolean) => void
}) {
  return (
    <div className="space-y-3">
      {feed.map((item, index) => {
        const selected = selectedIndex === index
        return (
          <div
            key={item.id}
            className={`phosphor ${selected ? 'ring-1 ring-[var(--color-accent)]' : ''}`}
            onClick={() => onSelect?.(index)}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onKeyDown={(e) => {
              if (onSelect && (e.key === 'Enter' || e.key === ' ')) onSelect(index)
            }}
          >
            <div className="mb-1 flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
              <span className="tabular">t+{formatVirtualTime(item.at)}</span>
              <span>·</span>
              <span>{item.kind.replace('_', ' ')}</span>
            </div>
            {item.kind === 'thought' && (
              <p className="thought text-[14px] text-[var(--color-text-secondary)]">{item.text}</p>
            )}
            {item.kind === 'tool' && <ToolCard tool={item.tool} />}
            {item.kind === 'approval' && (
              <ApprovalGate
                approval={item.approval}
                onResolve={(d) => onResolveApproval(item.approval.id, d)}
              />
            )}
            {item.kind === 'artifact' && (
              <div className="border border-[var(--color-hairline)] px-3 py-2">
                <div className="flex items-center gap-2">
                  <Chip>{item.artifact.kind}</Chip>
                  <span className="text-[12px]">{item.artifact.title}</span>
                </div>
                {item.artifact.preview && (
                  <p className="mt-1 text-[11px] whitespace-pre-wrap text-[var(--color-text-tertiary)]">
                    {item.artifact.preview}
                  </p>
                )}
              </div>
            )}
            {item.kind === 'memory' && (
              <MemoryMoment
                memory={item.memory}
                onCorrect={() => onCorrectMemory(item.memory.id)}
              />
            )}
            {item.kind === 'skill' && (
              <SkillMoment
                skill={item.skill}
                onResolve={(a) => onResolveSkill(item.skill.id, a)}
              />
            )}
            {item.kind === 'plan_revision' && (
              <div className="border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] px-3 py-2 text-[12px]">
                <div className="text-[var(--color-accent)]">Plan revised</div>
                <p className="mt-1 text-[var(--color-text-secondary)]">{item.reason}</p>
              </div>
            )}
            {item.kind === 'steer' && (
              <div className="border border-[var(--color-hairline-strong)] px-3 py-2 text-[12px] text-[var(--color-text-secondary)]">
                {item.message}
              </div>
            )}
            {item.kind === 'notification' && (
              <div className="border border-[var(--color-hairline)] px-3 py-2">
                <div className="text-[12px] text-[var(--color-text)]">{item.title}</div>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{item.body}</p>
              </div>
            )}
            {item.kind === 'system' && (
              <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.text}</p>
            )}
          </div>
        )
      })}
      {feed.length === 0 && (
        <p className="py-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
          Waiting for the first event…
        </p>
      )}
    </div>
  )
}
