import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoClock } from '../../components/DemoClock'
import { AwayRecap } from '../../components/patterns/AwayRecap'
import { ApprovalGate } from '../../components/patterns/ApprovalGate'
import { Button, Chip, Meter, SectionLabel, StatusDot } from '../../kit/primitives'
import { ThemeSwitcher } from '../../kit/ThemeSwitcher'
import { formatVirtualTime, useDemoStore } from '../../engine/store'

export function MobilePage() {
  const sessions = useDemoStore((s) => s.sessions)
  const setActiveSession = useDemoStore((s) => s.setActiveSession)
  const resolveApproval = useDemoStore((s) => s.resolveApproval)
  const awayRecapVisible = useDemoStore((s) => s.awayRecapVisible)
  const dismissRecap = useDemoStore((s) => s.dismissRecap)
  const [sheetOpen, setSheetOpen] = useState(true)

  useEffect(() => {
    setActiveSession('offsite')
  }, [setActiveSession])

  const session = sessions['offsite']
  const pendingApproval = useMemo(() => {
    if (!session) return null
    return Object.values(session.approvals).find((a) => a.status === 'pending') ?? null
  }, [session])

  const notifications = useMemo(() => {
    if (!session) return []
    return session.feed.filter(
      (f) =>
        f.kind === 'notification' ||
        f.kind === 'approval' ||
        f.kind === 'memory' ||
        f.kind === 'skill',
    )
  }, [session])

  const progress = useMemo(() => {
    if (!session || session.plan.length === 0) return 0
    const done = session.plan.filter((p) => p.status === 'done').length
    return (done / session.plan.length) * 100
  }, [session])

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--color-text-tertiary)]">
        Loading companion…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-lg flex-col px-3 py-4 sm:py-8">
        <div className="mb-4 flex items-center justify-between gap-2 px-1">
          <Link to="/" className="text-[12px] tracking-[0.16em] text-[var(--color-accent)]">
            ORRERY
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher compact />
            <Link to="/console" className="text-[11px] text-[var(--color-text-tertiary)]">
              open console
            </Link>
          </div>
        </div>

        {/* Device frame - collapses to full-bleed under 480px */}
        <div className="mobile-frame mx-auto w-full max-w-[390px] overflow-hidden border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] sm:rounded-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-hairline)] px-4 py-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                Companion
              </div>
              <div className="text-[13px] text-[var(--color-text)]">{session.meta.agentName}</div>
            </div>
            <StatusDot
              status={
                session.meta.triage === 'needs_you'
                  ? 'needs_you'
                  : session.meta.triage === 'done'
                    ? 'done'
                    : 'running'
              }
              pulse
            />
          </div>

          <div className="space-y-4 px-4 py-4">
            <div>
              <div className="text-[12px] text-[var(--color-text)]">{session.meta.taskTitle}</div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                <span className="tabular">t+{formatVirtualTime(session.virtualTimeMs)}</span>
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
              <Meter value={progress} className="mt-3" />
              <div className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                {session.plan.filter((p) => p.status === 'done').length}/{session.plan.length}{' '}
                steps
              </div>
            </div>

            <div>
              <SectionLabel>Notifications</SectionLabel>
              <ul className="mt-2 space-y-2">
                {notifications.length === 0 && (
                  <li className="text-[11px] text-[var(--color-text-tertiary)]">
                    Quiet for now. Agent is working.
                  </li>
                )}
                {[...notifications].reverse().slice(0, 6).map((n) => (
                  <li
                    key={n.id}
                    className="border border-[var(--color-hairline)] bg-[var(--color-bg)] px-3 py-2"
                  >
                    {n.kind === 'approval' && (
                      <>
                        <div className="flex items-center gap-2">
                          <Chip tone="danger">approval</Chip>
                          <span className="text-[12px]">{n.approval.title}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                          {n.approval.summary}
                        </p>
                        {n.approval.status === 'pending' && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => setSheetOpen(true)}
                          >
                            Review
                          </Button>
                        )}
                      </>
                    )}
                    {n.kind === 'notification' && (
                      <>
                        <div className="text-[12px]">{n.title}</div>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">{n.body}</p>
                      </>
                    )}
                    {n.kind === 'memory' && (
                      <p className="text-[12px] text-[var(--color-accent)]">Noted: {n.memory.text}</p>
                    )}
                    {n.kind === 'skill' && (
                      <p className="text-[12px]">
                        Skill proposed: <span className="text-[var(--color-accent)]">{n.skill.name}</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {session.currentThought && (
              <div>
                <SectionLabel>Latest reasoning</SectionLabel>
                <p className="thought mt-1 text-[13px] text-[var(--color-text-secondary)]">
                  {session.currentThought}
                </p>
              </div>
            )}
          </div>

          {/* Approval sheet */}
          {pendingApproval && sheetOpen && (
            <div className="border-t border-[var(--color-danger)]/40 bg-[var(--color-bg)] px-4 py-4">
              <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--color-danger)]">
                Needs you · plan step{' '}
                {pendingApproval.stepId ?? '-'}
              </div>
              <ApprovalGate
                approval={pendingApproval}
                onResolve={(d) => {
                  resolveApproval('offsite', pendingApproval.id, d)
                  setSheetOpen(false)
                }}
              />
            </div>
          )}
        </div>

        <p className="mt-4 px-1 text-center text-[10px] text-[var(--color-text-tertiary)]">
          Notification-driven companion for agents running elsewhere - approve from your pocket.
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        <DemoClock compact />
      </div>

      {awayRecapVisible && session.recap && (
        <AwayRecap recap={session.recap} onDismiss={dismissRecap} />
      )}
    </div>
  )
}
