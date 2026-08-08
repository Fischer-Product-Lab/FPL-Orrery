import { Button, Chip, SectionLabel } from '../../kit/primitives'
import type { MemoryNote, SkillProposal } from '../../engine/types'

export function MemoryMoment({
  memory,
  onCorrect,
}: {
  memory: MemoryNote
  onCorrect?: () => void
}) {
  return (
    <div className="border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] px-3 py-2">
      <div className="mb-1 flex items-center gap-2">
        <SectionLabel>Memory noted</SectionLabel>
        {memory.corrected && <Chip tone="warning">corrected</Chip>}
      </div>
      <p className="text-[12px] text-[var(--color-text)]">{memory.text}</p>
      {onCorrect && !memory.corrected && (
        <Button variant="ghost" className="mt-2 !px-2 !py-1" onClick={onCorrect}>
          Correct this
        </Button>
      )}
    </div>
  )
}

export function SkillMoment({
  skill,
  onResolve,
}: {
  skill: SkillProposal
  onResolve?: (accepted: boolean) => void
}) {
  return (
    <div className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-3 py-2">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <SectionLabel>Skill proposed</SectionLabel>
        {skill.accepted === true && <Chip tone="success">saved</Chip>}
        {skill.accepted === false && <Chip>dismissed</Chip>}
      </div>
      <h4 className="text-[13px] text-[var(--color-accent)]">{skill.name}</h4>
      <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{skill.description}</p>
      {onResolve && skill.accepted == null && (
        <div className="mt-2 flex gap-2">
          <Button variant="primary" onClick={() => onResolve(true)}>
            Save skill
          </Button>
          <Button variant="ghost" onClick={() => onResolve(false)}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}
