import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoClock } from '../../components/DemoClock'
import { AwayRecap } from '../../components/patterns/AwayRecap'
import {
  Button,
  Chip,
  HoldToConfirm,
  Meter,
  SectionLabel,
  StatusDot,
} from '../../kit/primitives'
import { formatVirtualTime, getSessionList, useDemoStore } from '../../engine/store'
import type {
  ApprovalRequest,
  Artifact,
  PlanStep,
  SessionState,
  ToolCall,
} from '../../engine/types'
import {
  approvalHeadline,
  buildFeedRows,
  digest,
  digestLine,
  filterMoments,
  friendlyDuration,
  friendlyElapsed,
  planProgress,
  rightNowSentence,
  statusSentence,
  steerSuggestions,
  translateFeed,
  type FeedFilter,
  type FriendlyMoment,
} from './translate'

type Altitude = 'simple' | 'detailed' | 'technical'

const ALTITUDE_KEY = 'rosetta-altitude'
const EXPLAINER_KEY = 'rosetta-explainer-dismissed'

function loadAltitude(): Altitude {
  try {
    const v = localStorage.getItem(ALTITUDE_KEY)
    if (v === 'simple' || v === 'detailed' || v === 'technical') return v
  } catch {
    /* ignore */
  }
  return 'detailed'
}

function loadExplainerDismissed(): boolean {
  try {
    return localStorage.getItem(EXPLAINER_KEY) === '1'
  } catch {
    return false
  }
}

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

  const [altitude, setAltitude] = useState<Altitude>(loadAltitude)
  const [openWork, setOpenWork] = useState<Set<string>>(new Set())
  const [expandedQuiet, setExpandedQuiet] = useState<Set<string>>(new Set())
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')
  const [explainerDismissed, setExplainerDismissed] = useState(loadExplainerDismissed)
  const [artifactOverlay, setArtifactOverlay] = useState<Artifact | null>(null)
  const [showIfNo, setShowIfNo] = useState(false)

  const steerRef = useRef<HTMLInputElement>(null)
  const steerSectionRef = useRef<HTMLElement>(null)

  const list = getSessionList(sessions)
  const session = activeSessionId ? sessions[activeSessionId] : null
  const moments = useMemo(
    () => (session ? translateFeed(session) : []),
    [session],
  )

  useEffect(() => {
    try {
      localStorage.setItem(ALTITUDE_KEY, altitude)
    } catch {
      /* ignore */
    }
  }, [altitude])

  const toggleWork = (id: string) => {
    setOpenWork((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isWorkOpen = (id: string) => altitude === 'technical' || openWork.has(id)

  if (!session || !activeSessionId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--color-text-tertiary)]">
        Loading…
      </div>
    )
  }

  const agent = session.meta.agentName
  const status = statusSentence(session)
  const progress = planProgress(session)
  const pendingApproval = Object.values(session.approvals).find((a) => a.status === 'pending')
  const needsYou = Boolean(pendingApproval) || session.meta.triage === 'needs_you'
  const nowLine = rightNowSentence(session)
  const counts = digest(moments)
  const filtered = filterMoments(
    pendingApproval
      ? moments.filter(
          (m) => !(m.kind === 'approval' && m.approval.id === pendingApproval.id),
        )
      : moments,
    feedFilter,
  )
  const rows = buildFeedRows(filtered, agent, {
    collapseQuiet: altitude === 'simple',
  })
  const newestId = moments[moments.length - 1]?.id
  const suggestions = steerSuggestions(activeSessionId)

  const askFirst = () => {
    setSteerDraft('Before you buy: ')
    setShowIfNo(false)
    steerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    requestAnimationFrame(() => steerRef.current?.focus())
  }

  const dismissExplainer = () => {
    setExplainerDismissed(true)
    try {
      localStorage.setItem(EXPLAINER_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const heroStatus: 'running' | 'needs_you' | 'done' | 'idle' = needsYou
    ? 'needs_you'
    : session.meta.triage === 'done'
      ? 'done'
      : session.meta.triage === 'running'
        ? 'running'
        : 'idle'

  return (
    <div className="flex min-h-[calc(100vh-49px)] flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel>Rosetta</SectionLabel>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              Named for the stone that made one decree readable in more than one script · same agent
              ·{' '}
              <Link to="/console" className="text-[var(--color-accent)]">
                open technical console
              </Link>
            </p>
          </div>
          <AltitudeControl value={altitude} onChange={setAltitude} />
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
        <div className="mt-8 flex items-start gap-3">
          <span
            className={`mt-2 inline-flex size-3 shrink-0 items-center justify-center rounded-full ${
              needsYou
                ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]'
                : ''
            }`}
          >
            <StatusDot
              status={heroStatus}
              pulse={heroStatus === 'running'}
              className="!size-2.5"
            />
          </span>
          <div className="min-w-0 flex-1">
            <h1
              className="display text-2xl leading-snug text-[var(--color-text)] sm:text-3xl"
              aria-live="polite"
            >
              {status}
            </h1>
            <p className="mt-2 text-[13px] text-[var(--color-text-tertiary)]">
              {digestLine(session)}
            </p>
            {progress.total > 0 && (
              <Meter
                value={progress.pct}
                className="mt-3 max-w-md"
                tone={needsYou ? 'danger' : session.meta.triage === 'done' ? 'success' : 'accent'}
              />
            )}
          </div>
        </div>

        {/* RIGHT NOW */}
        {nowLine && !pendingApproval && (
          <div className="mt-5 border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3">
            <SectionLabel>Right now</SectionLabel>
            <p className="thought mt-1.5 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              {nowLine}
            </p>
          </div>
        )}

        {/* Explainer */}
        {!explainerDismissed && (
          <div className="mt-6 border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SectionLabel>What this surface is</SectionLabel>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Rosetta translates the same event stream into plain sentences. Altitude (Simple /
                  Detailed / Technical) changes how much machinery you see; it does not change what
                  the agent is doing. Technical truth (invocation, output, provenance) stays one
                  gesture away.
                </p>
              </div>
              <Button variant="ghost" className="!px-2 !py-1 shrink-0" onClick={dismissExplainer}>
                Got it
              </Button>
            </div>
          </div>
        )}

        {/* Needs-you dock */}
        {pendingApproval && (
          <section className="mt-8 border border-[var(--color-accent)]/40 bg-[var(--color-accent-dim)] px-4 py-4">
            <SectionLabel>Needs your OK</SectionLabel>
            <div className="mt-3">
              <FriendlyApprovalBody
                headline={approvalHeadline(agent, pendingApproval)}
                summary={pendingApproval.summary}
                approval={pendingApproval}
                workOpen={isWorkOpen(`approval-${pendingApproval.id}`)}
                onToggleWork={() => toggleWork(`approval-${pendingApproval.id}`)}
                onResolve={(d) => resolveApproval(activeSessionId, pendingApproval.id, d)}
                showIfNo={showIfNo}
                onToggleIfNo={() => setShowIfNo((v) => !v)}
                onAskFirst={askFirst}
                plan={session.plan}
                featured
              />
            </div>
          </section>
        )}

        {/* Journey */}
        <section
          className={`mt-10 ${pendingApproval ? 'opacity-70' : ''}`}
        >
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
        <section className={`mt-10 ${pendingApproval ? 'opacity-70' : ''}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionLabel>What&apos;s happening</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['all', `All (${counts.all})`],
                  ['made_for_you', `Made for you (${counts.madeForYou})`],
                  ['decisions', `Decisions (${counts.decisions})`],
                  ['learning', `Learning (${counts.learning})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFeedFilter(key)}
                  className={`glint border px-2 py-1 text-[11px] transition-colors ${
                    feedFilter === key
                      ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                      : 'border-[var(--color-hairline)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {rows.length === 0 && (
              <p className="py-6 text-center text-[13px] text-[var(--color-text-tertiary)]">
                {moments.length === 0
                  ? 'Waiting for the first moment…'
                  : 'Nothing in this filter yet.'}
              </p>
            )}
            {rows.map((row) => {
              if (row.type === 'gap') {
                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 py-1 text-[11px] text-[var(--color-text-tertiary)]"
                  >
                    <div className="h-px flex-1 bg-[var(--color-hairline)]" />
                    <span>{row.label}</span>
                    <div className="h-px flex-1 bg-[var(--color-hairline)]" />
                  </div>
                )
              }
              if (row.type === 'quiet_group') {
                const open = expandedQuiet.has(row.id)
                return (
                  <div
                    key={row.id}
                    className="border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 text-left text-[14px] text-[var(--color-text-secondary)]"
                      onClick={() =>
                        setExpandedQuiet((prev) => {
                          const next = new Set(prev)
                          if (next.has(row.id)) next.delete(row.id)
                          else next.add(row.id)
                          return next
                        })
                      }
                    >
                      <span>
                        {row.agentName} worked quietly: {row.count} steps
                      </span>
                      <span className="text-[11px] text-[var(--color-accent)]">
                        {open ? 'Hide' : 'Show'}
                      </span>
                    </button>
                    {open && (
                      <div className="mt-3 space-y-3 border-t border-[var(--color-hairline)] pt-3">
                        {row.moments.map((m) => (
                          <MomentCard
                            key={m.id}
                            moment={m}
                            agentName={agent}
                            session={session}
                            workOpen={isWorkOpen(m.id)}
                            onToggleWork={() => toggleWork(m.id)}
                            onResolveApproval={(id, d) =>
                              resolveApproval(activeSessionId, id, d)
                            }
                            onCorrectMemory={(id) => correctMemory(activeSessionId, id)}
                            onResolveSkill={(id, a) => resolveSkill(activeSessionId, id, a)}
                            onLookArtifact={setArtifactOverlay}
                            highlight={m.id === newestId}
                            nested
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <MomentCard
                  key={row.moment.id}
                  moment={row.moment}
                  agentName={agent}
                  session={session}
                  workOpen={isWorkOpen(row.moment.id)}
                  onToggleWork={() => toggleWork(row.moment.id)}
                  onResolveApproval={(id, d) => resolveApproval(activeSessionId, id, d)}
                  onCorrectMemory={(id) => correctMemory(activeSessionId, id)}
                  onResolveSkill={(id, a) => resolveSkill(activeSessionId, id, a)}
                  onLookArtifact={setArtifactOverlay}
                  highlight={row.moment.id === newestId}
                />
              )
            })}
          </div>
        </section>

        {/* Steer */}
        <section
          ref={steerSectionRef}
          className={`mt-10 border-t border-[var(--color-hairline)] pt-6 pb-8 ${
            pendingApproval ? 'opacity-90' : ''
          }`}
        >
          <SectionLabel>Tell {agent} something</SectionLabel>
          <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
            Guide the work without stopping it.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSteerDraft(s)
                  steerRef.current?.focus()
                }}
                className="glint border border-[var(--color-hairline)] px-2.5 py-1.5 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              ref={steerRef}
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

      {artifactOverlay && (
        <ArtifactOverlay
          artifact={artifactOverlay}
          session={session}
          onClose={() => setArtifactOverlay(null)}
        />
      )}
    </div>
  )
}

function AltitudeControl({
  value,
  onChange,
}: {
  value: Altitude
  onChange: (v: Altitude) => void
}) {
  const options: { id: Altitude; label: string }[] = [
    { id: 'simple', label: 'Simple' },
    { id: 'detailed', label: 'Detailed' },
    { id: 'technical', label: 'Technical' },
  ]
  return (
    <div
      className="glint inline-flex border border-[var(--color-hairline)] p-0.5"
      role="radiogroup"
      aria-label="Altitude"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`glint px-2.5 py-1.5 text-[11px] tracking-wide transition-colors ${
            value === o.id
              ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function friendlyTaskTitle(title: string): string {
  if (title.length <= 42) return title
  return `${title.slice(0, 40)}…`
}

function MomentCard({
  moment,
  agentName,
  session,
  workOpen,
  onToggleWork,
  onResolveApproval,
  onCorrectMemory,
  onResolveSkill,
  onLookArtifact,
  highlight,
  nested,
}: {
  moment: FriendlyMoment
  agentName: string
  session: SessionState
  workOpen: boolean
  onToggleWork: () => void
  onResolveApproval: (id: string, d: 'approved' | 'rejected') => void
  onCorrectMemory: (id: string) => void
  onResolveSkill: (id: string, accepted: boolean) => void
  onLookArtifact: (a: Artifact) => void
  highlight?: boolean
  nested?: boolean
}) {
  return (
    <article
      className={`${
        nested
          ? 'border-0 bg-transparent px-0 py-1'
          : 'glint border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3'
      } ${highlight && !nested ? 'phosphor' : ''}`}
    >
      <div className="mb-1.5 flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
        <span className="font-mono text-[var(--color-text-secondary)]">
          {momentGlyph(moment.kind)}
        </span>
        <span>·</span>
        <span>{momentLabel(moment.kind)}</span>
        <span>·</span>
        <span>{friendlyElapsed(moment.at)}</span>
      </div>

      {moment.kind === 'tool' && (
        <FriendlyToolBody
          sentence={moment.sentence}
          tool={moment.tool}
          workOpen={workOpen}
          onToggleWork={onToggleWork}
          plan={session.plan}
          artifacts={session.artifacts}
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
          plan={session.plan}
        />
      )}

      {moment.kind === 'artifact' && (
        <div>
          <p className="text-[15px] leading-relaxed text-[var(--color-text)]">{moment.sentence}</p>
          {moment.artifact.preview && (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[12px] text-[var(--color-text-secondary)]">
              {moment.artifact.preview}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="!px-2 !py-1"
              onClick={() => onLookArtifact(moment.artifact)}
            >
              Look at it
            </Button>
            <button
              type="button"
              onClick={onToggleWork}
              className="text-[11px] text-[var(--color-accent)] hover:underline"
            >
              {workOpen ? 'Hide the work' : 'How did it do this?'}
            </button>
          </div>
          {workOpen && (
            <ArtifactWorkPanel artifact={moment.artifact} plan={session.plan} />
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
          {moment.corrected && (
            <Chip tone="warning" className="mt-2">
              corrected
            </Chip>
          )}
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
          {moment.accepted === true && (
            <Chip tone="success" className="mt-2">
              saved
            </Chip>
          )}
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

      <span className="sr-only">{agentName}</span>
    </article>
  )
}

export function FriendlyToolBody({
  sentence,
  tool,
  workOpen,
  onToggleWork,
  plan = [],
  artifacts = [],
}: {
  sentence: string
  tool: ToolCall
  workOpen: boolean
  onToggleWork: () => void
  plan?: PlanStep[]
  artifacts?: Artifact[]
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
      {workOpen && <ToolWorkPanel tool={tool} plan={plan} artifacts={artifacts} />}
    </div>
  )
}

function ToolWorkPanel({
  tool,
  plan,
  artifacts,
}: {
  tool: ToolCall
  plan: PlanStep[]
  artifacts: Artifact[]
}) {
  const [tab, setTab] = useState<'invocation' | 'output' | 'provenance'>('invocation')
  const step = plan.find((s) => s.id === tool.stepId)
  const produced = artifacts.filter((a) => a.toolCallId === tool.id)
  const duration = friendlyDuration(tool.startedAt, tool.completedAt)

  return (
    <div className="mt-3 border border-[var(--color-hairline)] bg-[var(--color-bg)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-hairline)] px-3 py-2">
        <span className="font-mono text-[11px] text-[var(--color-text)]">{tool.name}</span>
        <Chip tone={tool.risk === 'low' ? 'default' : tool.risk === 'medium' ? 'warning' : 'danger'}>
          {tool.risk}
        </Chip>
        <Chip
          tone={
            tool.status === 'running' ? 'accent' : tool.status === 'failed' ? 'danger' : 'success'
          }
        >
          {tool.status}
        </Chip>
        {tool.startedAt != null && (
          <span className="tabular text-[10px] text-[var(--color-text-tertiary)]">
            t+{formatVirtualTime(tool.startedAt)}
          </span>
        )}
        {duration && (
          <span className="text-[10px] text-[var(--color-text-tertiary)]">{duration}</span>
        )}
      </div>
      <div className="flex gap-0 border-b border-[var(--color-hairline)]">
        {(['invocation', 'output', 'provenance'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] ${
              tab === t
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="px-3 py-2">
        {tab === 'invocation' && (
          <div>
            <CopyBlock text={tool.invocation} />
            <pre className="mt-2 overflow-x-auto text-[11px] text-[var(--color-text-secondary)]">
              {tool.invocation}
            </pre>
          </div>
        )}
        {tab === 'output' && (
          <div>
            <CopyBlock text={tool.output || '(no output yet)'} />
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] text-[var(--color-text-tertiary)]">
              {tool.output || '(no output yet)'}
            </pre>
          </div>
        )}
        {tab === 'provenance' && (
          <ul className="space-y-1.5 text-[12px] text-[var(--color-text-secondary)]">
            <li>
              <span className="text-[var(--color-text-tertiary)]">Plan step: </span>
              {step?.label ?? (tool.stepId ? tool.stepId : 'none')}
            </li>
            <li>
              <span className="text-[var(--color-text-tertiary)]">Tool id: </span>
              <span className="font-mono text-[11px]">{tool.id}</span>
            </li>
            <li>
              <span className="text-[var(--color-text-tertiary)]">Artifacts: </span>
              {produced.length === 0
                ? 'none from this call'
                : produced.map((a) => a.title).join(', ')}
            </li>
            {tool.startedAt != null && (
              <li className="tabular text-[11px] text-[var(--color-text-tertiary)]">
                started t+{formatVirtualTime(tool.startedAt)}
                {tool.completedAt != null
                  ? ` · finished t+${formatVirtualTime(tool.completedAt)}`
                  : ' · still running'}
              </li>
            )}
          </ul>
        )}
      </div>
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
  showIfNo,
  onToggleIfNo,
  onAskFirst,
  plan = [],
  featured,
}: {
  headline: string
  summary: string
  approval: ApprovalRequest
  workOpen: boolean
  onToggleWork: () => void
  onResolve: (d: 'approved' | 'rejected') => void
  showIfNo?: boolean
  onToggleIfNo?: () => void
  onAskFirst?: () => void
  plan?: PlanStep[]
  featured?: boolean
}) {
  const needsHold = approval.risk === 'money' || approval.risk === 'destructive'
  const pending = approval.status === 'pending'
  const step = plan.find((s) => s.id === approval.stepId)

  return (
    <div>
      <p
        className={`${
          featured ? 'display text-xl' : 'text-[15px]'
        } leading-relaxed text-[var(--color-text)]`}
      >
        {headline}
      </p>
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
          <div className="text-[10px] uppercase tracking-[0.14em]">Technical detail</div>
          <ul className="mt-2 space-y-1 text-[12px] text-[var(--color-text-secondary)]">
            <li>Risk: {approval.risk}</li>
            <li>Plan step: {step?.label ?? approval.stepId ?? 'none'}</li>
            {approval.expiresAt != null && (
              <li className="tabular">expires at t+{formatVirtualTime(approval.expiresAt)}</li>
            )}
            <li className="font-mono text-[11px]">id {approval.id}</li>
          </ul>
        </div>
      )}
      {pending && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
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
            {onAskFirst && (
              <Button variant="ghost" onClick={onAskFirst}>
                Ask a question first
              </Button>
            )}
          </div>
          {onToggleIfNo && (
            <div>
              <button
                type="button"
                onClick={onToggleIfNo}
                className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
              >
                {showIfNo ? 'Hide' : 'What happens if I say no?'}
              </button>
              {showIfNo && (
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                  {needsHold
                    ? 'Nothing is bought. The agent pauses and waits for your next instruction.'
                    : 'The agent pauses this step and waits. Nothing lasting changes until you say so.'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ArtifactWorkPanel({
  artifact,
  plan,
}: {
  artifact: Artifact
  plan: PlanStep[]
}) {
  const step = plan.find((s) => s.id === artifact.stepId)
  return (
    <div className="mt-3 border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-2 text-[12px] text-[var(--color-text-secondary)]">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        Provenance
      </div>
      <ul className="mt-2 space-y-1">
        <li>Kind: {artifact.kind}</li>
        <li>Plan step: {step?.label ?? artifact.stepId ?? 'none'}</li>
        <li>
          Tool:{' '}
          <span className="font-mono text-[11px]">{artifact.toolCallId ?? 'none'}</span>
        </li>
        <li className="tabular text-[11px] text-[var(--color-text-tertiary)]">
          created t+{formatVirtualTime(artifact.createdAt)}
        </li>
      </ul>
    </div>
  )
}

function ArtifactOverlay({
  artifact,
  session,
  onClose,
}: {
  artifact: Artifact
  session: SessionState
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-auto border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={artifact.title}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <SectionLabel>Made for you</SectionLabel>
            <h2 className="display mt-1 text-xl text-[var(--color-text)]">{artifact.title}</h2>
          </div>
          <Button variant="ghost" className="!px-2 !py-1" onClick={onClose}>
            Close
          </Button>
        </div>
        {artifact.preview && (
          <pre className="mt-4 whitespace-pre-wrap border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-3 text-[12px] text-[var(--color-text-secondary)]">
            {artifact.preview}
          </pre>
        )}
        <ArtifactWorkPanel artifact={artifact} plan={session.plan} />
      </div>
    </div>
  )
}

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-accent)] hover:underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1400)
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

function momentGlyph(kind: FriendlyMoment['kind']): string {
  switch (kind) {
    case 'tool':
      return '▸'
    case 'approval':
      return '◎'
    case 'artifact':
      return '◇'
    case 'memory':
      return '◉'
    case 'skill':
      return '✦'
    case 'plan_revision':
      return '↻'
    case 'thought':
      return '·'
    case 'steer':
      return '→'
    default:
      return '·'
  }
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
