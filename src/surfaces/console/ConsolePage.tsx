import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { DemoClock } from '../../components/DemoClock'
import { FeedStream } from '../../components/FeedStream'
import { AwayRecap } from '../../components/patterns/AwayRecap'
import { ArtifactLedger } from '../../components/patterns/ArtifactLedger'
import { FleetTriage } from '../../components/patterns/FleetTriage'
import { PlanSpine } from '../../components/patterns/PlanSpine'
import { ReasoningTicker } from '../../components/patterns/ReasoningTicker'
import { Button, Chip, SectionLabel } from '../../kit/primitives'
import { getSessionList, useDemoStore } from '../../engine/store'

export function ConsolePage() {
  const sessions = useDemoStore((s) => s.sessions)
  const activeSessionId = useDemoStore((s) => s.activeSessionId)
  const setActiveSession = useDemoStore((s) => s.setActiveSession)
  const awayRecapVisible = useDemoStore((s) => s.awayRecapVisible)
  const dismissRecap = useDemoStore((s) => s.dismissRecap)
  const resolveApproval = useDemoStore((s) => s.resolveApproval)
  const correctMemory = useDemoStore((s) => s.correctMemory)
  const resolveSkill = useDemoStore((s) => s.resolveSkill)
  const steerDraft = useDemoStore((s) => s.steerDraft)
  const setSteerDraft = useDemoStore((s) => s.setSteerDraft)
  const submitSteer = useDemoStore((s) => s.submitSteer)
  const selectedFeedIndex = useDemoStore((s) => s.selectedFeedIndex)
  const setSelectedFeedIndex = useDemoStore((s) => s.setSelectedFeedIndex)

  const list = getSessionList(sessions)
  const session = activeSessionId ? sessions[activeSessionId] : null
  const feedRef = useRef<HTMLDivElement>(null)
  const feedLen = session?.feed.length ?? 0

  useEffect(() => {
    const el = feedRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [feedLen, activeSessionId])

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col">
      <div className="flex min-h-0 flex-1">
        {/* Fleet sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-hairline)] bg-[var(--color-surface)] md:flex">
          <div className="border-b border-[var(--color-hairline)] px-3 py-3">
            <SectionLabel>Fleet triage</SectionLabel>
            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
              Attention is the scarce resource
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <FleetTriage
              sessions={list}
              activeId={activeSessionId}
              onSelect={setActiveSession}
            />
          </div>
          <div className="border-t border-[var(--color-hairline)] p-3 text-[10px] text-[var(--color-text-tertiary)]">
            Also view as{' '}
            <Link to="/rosetta" className="text-[var(--color-accent)]">
              rosetta
            </Link>
            ,{' '}
            <Link to="/observatory" className="text-[var(--color-accent)]">
              observatory
            </Link>
            ,{' '}
            <Link to="/terminal" className="text-[var(--color-accent)]">
              terminal
            </Link>
            , or{' '}
            <Link to="/mobile" className="text-[var(--color-accent)]">
              mobile
            </Link>
          </div>
        </aside>

        {/* Main session */}
        <div className="flex min-w-0 flex-1 flex-col">
          {session ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-hairline)] px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-[14px] text-[var(--color-text)]">
                      {session.meta.taskTitle}
                    </h1>
                    <Chip
                      tone={
                        session.meta.triage === 'needs_you'
                          ? 'danger'
                          : session.meta.triage === 'done'
                            ? 'success'
                            : 'accent'
                      }
                    >
                      {session.meta.triage.replace('_', ' ')}
                    </Chip>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                    {session.meta.agentName} · {session.meta.backend} ·{' '}
                    <span className="tabular">${session.meta.costUsd.toFixed(2)}</span>
                  </div>
                </div>
                <div className="ml-auto md:hidden">
                  <select
                    className="border border-[var(--color-hairline)] bg-[var(--color-surface)] px-2 py-1 text-[12px]"
                    value={activeSessionId ?? ''}
                    onChange={(e) => setActiveSession(e.target.value)}
                  >
                    {list.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.taskTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_1fr_260px]">
                <div className="hidden overflow-y-auto border-r border-[var(--color-hairline)] p-3 lg:block">
                  <PlanSpine
                    steps={session.plan}
                    revisionReason={session.planRevisionReason}
                    diff={session.planDiff}
                  />
                </div>

                <div className="flex min-h-0 flex-col">
                  <div className="border-b border-[var(--color-hairline)] px-4 py-3">
                    <ReasoningTicker
                      current={session.currentThought}
                      history={session.thoughts}
                    />
                  </div>
                  <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-4">
                    <FeedStream
                      feed={session.feed}
                      selectedIndex={selectedFeedIndex}
                      onSelect={setSelectedFeedIndex}
                      onResolveApproval={(id, d) =>
                        activeSessionId && resolveApproval(activeSessionId, id, d)
                      }
                      onCorrectMemory={(id) =>
                        activeSessionId && correctMemory(activeSessionId, id)
                      }
                      onResolveSkill={(id, a) =>
                        activeSessionId && resolveSkill(activeSessionId, id, a)
                      }
                    />
                  </div>
                  <div className="border-t border-[var(--color-hairline)] px-4 py-2">
                    <SectionLabel>Interrupt & steer</SectionLabel>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        value={steerDraft}
                        onChange={(e) => setSteerDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && activeSessionId) submitSteer(activeSessionId)
                        }}
                        placeholder="Steer without killing the run…"
                        className="min-w-0 flex-1 border border-[var(--color-hairline)] bg-[var(--color-bg)] px-2 py-1.5 text-[12px] outline-none focus:border-[var(--color-accent)]"
                      />
                      <Button
                        variant="outline"
                        onClick={() => activeSessionId && submitSteer(activeSessionId)}
                      >
                        Steer
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="hidden overflow-y-auto border-l border-[var(--color-hairline)] p-3 lg:block">
                  <ArtifactLedger artifacts={session.artifacts} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-[var(--color-text-tertiary)]">
              Loading sessions…
            </div>
          )}
        </div>
      </div>

      <DemoClock />

      {awayRecapVisible && session?.recap && (
        <AwayRecap recap={session.recap} onDismiss={dismissRecap} />
      )}
    </div>
  )
}
