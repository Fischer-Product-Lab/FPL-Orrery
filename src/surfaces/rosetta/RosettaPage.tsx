import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoClock } from '../../components/DemoClock'
import { AwayRecap } from '../../components/patterns/AwayRecap'
import { Button, Chip, HoldToConfirm, SectionLabel } from '../../kit/primitives'
import { formatVirtualTime, getSessionList, useDemoStore } from '../../engine/store'
import type { ApprovalRequest, ToolCall } from '../../engine/types'
import {
  statusSentence,
  translateFeed,
  type FriendlyMoment,
} from './translate'

export function RosettaPage() {
  const sessions = useDemoStore((s) => s.sessions)
  const activeSessionId = useDemoStore((s) => s.activeSessionId)
  const setActiveSession = useDemoStore((s) => s.setActiveSession)
  const resolveApproval = useDemoStore((s) => s.resolveApproval)
  const correctMemory = useDemoStore((s) => s.correctMemory)
  const resolveSkill = useDemoStore((s) => s.resolveSkill)
  const steerDraft = useDemoStore((s) => s.steerDraft)
  const setSteerDraft = useDemoStore((s) => s.setSteerDraft)
  const submitSteer = useDemoStore((s) => s.submitSteer)
  const awayRecapVisible = useDemoStore((s) => s.awayRecapVisible)
  const dismissRecap = useDemoStore((s) => s.dismissRecap)

  const [showAllTechnical, setShowAllTechnical] = useState(false)
  const [openWork, setOpenWork] = useState<Set<string>>(new Set())

  const list = getSessionList(sessions)
  const session = activeSessionId ? sessions[activeSessionId] : null
  const moments = useMemo(
    () => (session ? translateFeed(session) : []),
    [session],
  )

  const toggleWork = (id: string) => {
    setOpenWork((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isWorkOpen = (id: string) => showAllTechnical || openWork.has(id)

  if (!session || !activeSessionId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--color-text-tertiary)]">
        Loading…
      </div>
    )
  }

  const agent = session.meta.agentName
  const status = statusSentence(session)

  return (
    <div className="flex min-h-[calc(100vh-49px)] flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel>Rosetta</SectionLabel>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              Plain language · same agent under the hood ·{' '}
              <Link to="/console" className="text-[var(--color-accent)]">
                open technical console
              </Link>
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 border border-[var(--color-hairline)] px-2 py-1.5 text-[12px] text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={showAllTechnical}
              onChange={(e) => setShowAllTechnical(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Show technical detail
          </label>
        </div>

        {/* Session picker */}
        <div className="mt-6">
          <label className="text-[11px] text-[var(--color-text-tertiary)]">Watching</label>
          <select
            className="mt-1 w-full border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2.5 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            value={activeSessionId}
            onChange={(e) => setActiveSession(e.target.value)}
          >
            {list.map((s) => (
              <option key={s.id} value={s.id}>
                {s.agentName} · {friendlyTaskTitle(s.taskTitle)}
              </option>
            ))}
          </select>
        </div>

        {/* Status hero */}
        <h1 className="display mt-8 text-2xl leading-snug text-[var(--color-text)] sm:text-3xl">
          {status}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-text-tertiary)]">
          {agent} · {session.meta.backend} ·{' '}
          <span className="tabular">${session.meta.costUsd.toFixed(2)}</span> so far
        </p>

        {/* What is an agent */}
        <div className="mt-6 border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3">
          <SectionLabel>What is an agent?</SectionLabel>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            An agent is a helper that can use tools and work over time (searching, booking, fixing,
            training) while you check in when something needs your judgment. You supervise; it does
            the steps.
          </p>
        </div>

        {/* Journey */}
        <section className="mt-10">
          <SectionLabel>The journey</SectionLabel>
          {session.planRevisionReason && (
            <p className="mt-3 border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] px-3 py-2 text-[13px] text-[var(--color-text)]">
              The plan changed: {session.planRevisionReason}
            </p>
          )}
          <ol className="mt-3 space-y-2">
            {session.plan.length === 0 && (
              <li className="text-[13px] text-[var(--color-text-tertiary)]">
                No steps yet. {agent} is still getting started.
              </li>
            )}
            {session.plan.map((step, i) => {
              const here = step.status === 'active'
              return (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 px-2 py-2 ${
                    here ? 'bg-[var(--color-accent-dim)]' : ''
                  }`}
                >
                  <span className="tabular text-[12px] text-[var(--color-text-tertiary)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[15px] ${
                        step.status === 'done'
                          ? 'text-[var(--color-text-tertiary)] line-through'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      {step.label}
                    </div>
                    {here && (
                      <div className="mt-0.5 text-[11px] text-[var(--color-accent)]">
                        you are here
                      </div>
                    )}
                    {step.status === 'done' && (
                      <Chip tone="success" className="mt-1">
                        done
                      </Chip>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Moments */}
        <section className="mt-10">
          <SectionLabel>What&apos;s happening</SectionLabel>
          <div className="mt-3 space-y-3">
            {moments.length === 0 && (
              <p className="py-6 text-center text-[13px] text-[var(--color-text-tertiary)]">
                Waiting for the first moment…
              </p>
            )}
            {moments.map((m) => (
              <MomentCard
                key={m.id}
                moment={m}
                agentName={agent}
                workOpen={isWorkOpen(m.id)}
                onToggleWork={() => toggleWork(m.id)}
                onResolveApproval={(id, d) => resolveApproval(activeSessionId, id, d)}
                onCorrectMemory={(id) => correctMemory(activeSessionId, id)}
                onResolveSkill={(id, a) => resolveSkill(activeSessionId, id, a)}
              />
            ))}
          </div>
        </section>

        {/* Steer */}
        <section className="mt-10 border-t border-[var(--color-hairline)] pt-6 pb-8">
          <SectionLabel>Tell {agent} something</SectionLabel>
          <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
            Guide the work without stopping it.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={steerDraft}
              onChange={(e) => setSteerDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSteer(activeSessionId)
              }}
              placeholder={`Tell ${agent} something…`}
              className="min-w-0 flex-1 border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--color-accent)]"
            />
            <Button variant="primary" onClick={() => submitSteer(activeSessionId)}>
              Send
            </Button>
          </div>
        </section>
      </div>

      <DemoClock compact />

      {awayRecapVisible && session.recap && (
        <AwayRecap recap={session.recap} onDismiss={dismissRecap} />
      )}
    </div>
  )
}

function friendlyTaskTitle(title: string): string {
  // Shorten long titles for the picker
  if (title.length <= 42) return title
  return `${title.slice(0, 40)}…`
}

function MomentCard({
  moment,
  agentName,
  workOpen,
  onToggleWork,
  onResolveApproval,
  onCorrectMemory,
  onResolveSkill,
}: {
  moment: FriendlyMoment
  agentName: string
  workOpen: boolean
  onToggleWork: () => void
  onResolveApproval: (id: string, d: 'approved' | 'rejected') => void
  onCorrectMemory: (id: string) => void
  onResolveSkill: (id: string, accepted: boolean) => void
}) {
  return (
    <article className="border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
        <span className="tabular">t+{formatVirtualTime(moment.at)}</span>
        <span>·</span>
        <span>{momentLabel(moment.kind)}</span>
      </div>

      {moment.kind === 'tool' && (
        <FriendlyToolBody
          sentence={moment.sentence}
          tool={moment.tool}
          workOpen={workOpen}
          onToggleWork={onToggleWork}
        />
      )}

      {moment.kind === 'approval' && (
        <FriendlyApprovalBody
          headline={moment.headline}
          summary={moment.summary}
          approval={moment.approval}
          workOpen={workOpen}
          onToggleWork={onToggleWork}
          onResolve={(d) => onResolveApproval(moment.approval.id, d)}
        />
      )}

      {moment.kind === 'artifact' && (
        <div>
          <p className="text-[15px] leading-relaxed text-[var(--color-text)]">{moment.sentence}</p>
          {moment.artifact.preview && (
            <p className="mt-2 whitespace-pre-wrap text-[12px] text-[var(--color-text-secondary)]">
              {moment.artifact.preview}
            </p>
          )}
        </div>
      )}

      {moment.kind === 'memory' && (
        <div>
          <p className="text-[15px] leading-relaxed text-[var(--color-text)]">{moment.sentence}</p>
          {!moment.corrected && (
            <Button
              variant="ghost"
              className="mt-2 !px-2 !py-1"
              onClick={() => onCorrectMemory(moment.memoryId)}
            >
              That&apos;s not right
            </Button>
          )}
          {moment.corrected && <Chip tone="warning" className="mt-2">corrected</Chip>}
        </div>
      )}

      {moment.kind === 'skill' && (
        <div>
          <p className="text-[15px] leading-relaxed text-[var(--color-text)]">{moment.sentence}</p>
          {moment.accepted == null && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => onResolveSkill(moment.skillId, true)}>
                Save skill
              </Button>
              <Button variant="ghost" onClick={() => onResolveSkill(moment.skillId, false)}>
                No thanks
              </Button>
            </div>
          )}
          {moment.accepted === true && <Chip tone="success" className="mt-2">saved</Chip>}
          {moment.accepted === false && <Chip className="mt-2">dismissed</Chip>}
        </div>
      )}

      {(moment.kind === 'plan_revision' ||
        moment.kind === 'thought' ||
        moment.kind === 'steer' ||
        moment.kind === 'notification' ||
        moment.kind === 'system') && (
        <p
          className={`text-[15px] leading-relaxed ${
            moment.kind === 'thought'
              ? 'thought text-[var(--color-text-secondary)]'
              : 'text-[var(--color-text)]'
          }`}
        >
          {moment.sentence}
        </p>
      )}

      {/* unused but keep agentName available for future */}
      <span className="sr-only">{agentName}</span>
    </article>
  )
}

export function FriendlyToolBody({
  sentence,
  tool,
  workOpen,
  onToggleWork,
}: {
  sentence: string
  tool: ToolCall
  workOpen: boolean
  onToggleWork: () => void
}) {
  return (
    <div>
      <p className="text-[15px] leading-relaxed text-[var(--color-text)]">{sentence}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {tool.resultChip && <Chip tone="accent">{tool.resultChip}</Chip>}
        <Chip
          tone={
            tool.status === 'running' ? 'accent' : tool.status === 'failed' ? 'danger' : 'success'
          }
        >
          {tool.status === 'running' ? 'in progress' : tool.status}
        </Chip>
        <button
          type="button"
          onClick={onToggleWork}
          className="text-[11px] text-[var(--color-accent)] hover:underline"
        >
          {workOpen ? 'Hide the work' : 'How did it do this?'}
        </button>
      </div>
      {workOpen && (
        <div className="mt-3 space-y-2 border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
            Technical detail
          </div>
          <pre className="overflow-x-auto text-[11px] text-[var(--color-text-secondary)]">
            {tool.invocation}
          </pre>
          {tool.output && (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[11px] text-[var(--color-text-tertiary)]">
              {tool.output}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

function FriendlyApprovalBody({
  headline,
  summary,
  approval,
  workOpen,
  onToggleWork,
  onResolve,
}: {
  headline: string
  summary: string
  approval: ApprovalRequest
  workOpen: boolean
  onToggleWork: () => void
  onResolve: (d: 'approved' | 'rejected') => void
}) {
  const needsHold = approval.risk === 'money' || approval.risk === 'destructive'
  const pending = approval.status === 'pending'

  return (
    <div
      className={
        pending
          ? 'rounded-none'
          : ''
      }
    >
      <p className="text-[15px] leading-relaxed text-[var(--color-text)]">{headline}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
        {summary}
      </p>
      <ul className="mt-2 space-y-1 text-[12px] text-[var(--color-text-tertiary)]">
        {approval.evidence.map((e) => (
          <li key={e}>· {e}</li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Chip
          tone={
            approval.status === 'approved'
              ? 'success'
              : approval.status === 'rejected'
                ? 'danger'
                : 'warning'
          }
        >
          {approval.status === 'pending' ? 'needs your OK' : approval.status}
        </Chip>
        {approval.costUsd != null && (
          <Chip tone="accent" className="tabular">
            ${approval.costUsd.toLocaleString()}
          </Chip>
        )}
        <button
          type="button"
          onClick={onToggleWork}
          className="text-[11px] text-[var(--color-accent)] hover:underline"
        >
          {workOpen ? 'Hide the work' : 'How did it do this?'}
        </button>
      </div>
      {workOpen && (
        <div className="mt-3 border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-2 text-[11px] text-[var(--color-text-tertiary)]">
          Risk: {approval.risk}
          {approval.stepId ? ` · step ${approval.stepId}` : ''}
          {approval.expiresAt != null
            ? ` · expires at t+${formatVirtualTime(approval.expiresAt)}`
            : ''}
        </div>
      )}
      {pending && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {needsHold ? (
            <div>
              <HoldToConfirm label="Hold to approve" onConfirm={() => onResolve('approved')} />
              <p className="mt-1 text-[10px] text-[var(--color-danger)]">
                press and hold: this spends real money
              </p>
            </div>
          ) : (
            <Button variant="primary" onClick={() => onResolve('approved')}>
              Yes, go ahead
            </Button>
          )}
          <Button variant="ghost" onClick={() => onResolve('rejected')}>
            No, not now
          </Button>
        </div>
      )}
    </div>
  )
}

function momentLabel(kind: FriendlyMoment['kind']): string {
  switch (kind) {
    case 'tool':
      return 'action'
    case 'approval':
      return 'decision'
    case 'artifact':
      return 'made for you'
    case 'memory':
      return 'memory'
    case 'skill':
      return 'skill'
    case 'plan_revision':
      return 'plan update'
    case 'thought':
      return 'thinking'
    case 'steer':
      return 'your guidance'
    case 'notification':
      return 'update'
    default:
      return 'note'
  }
}
