import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoClock } from '../../components/DemoClock'
import { AwayRecap } from '../../components/patterns/AwayRecap'
import { Keycap } from '../../kit/primitives'
import { ThemeSwitcher } from '../../kit/ThemeSwitcher'
import { useActiveTheme } from '../../kit/theme'
import { formatVirtualTime, useDemoStore } from '../../engine/store'

export function TerminalPage() {
  const sessions = useDemoStore((s) => s.sessions)
  const setActiveSession = useDemoStore((s) => s.setActiveSession)
  const resolveApproval = useDemoStore((s) => s.resolveApproval)
  const submitSteer = useDemoStore((s) => s.submitSteer)
  const setSteerDraft = useDemoStore((s) => s.setSteerDraft)
  const steerDraft = useDemoStore((s) => s.steerDraft)
  const awayRecapVisible = useDemoStore((s) => s.awayRecapVisible)
  const dismissRecap = useDemoStore((s) => s.dismissRecap)
  const selectedFeedIndex = useDemoStore((s) => s.selectedFeedIndex)
  const setSelectedFeedIndex = useDemoStore((s) => s.setSelectedFeedIndex)

  const session = sessions['offsite']
  const theme = useActiveTheme()
  const [mode, setMode] = useState<'nav' | 'steer'>('nav')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    setActiveSession('offsite')
  }, [setActiveSession])

  const pendingApproval = useMemo(() => {
    if (!session) return null
    return Object.values(session.approvals).find((a) => a.status === 'pending') ?? null
  }, [session])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!session) return
      if (mode === 'steer') {
        if (e.key === 'Escape') {
          setMode('nav')
          setSteerDraft('')
        } else if (e.key === 'Enter') {
          submitSteer('offsite')
          setMode('nav')
        }
        return
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedFeedIndex(
          Math.min(session.feed.length - 1, Math.max(0, selectedFeedIndex + 1)),
        )
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedFeedIndex(Math.max(0, selectedFeedIndex - 1))
      } else if (e.key === 'Enter') {
        const item = session.feed[selectedFeedIndex]
        if (item) {
          setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(item.id)) next.delete(item.id)
            else next.add(item.id)
            return next
          })
        }
      } else if (e.key === 'y' && pendingApproval) {
        resolveApproval('offsite', pendingApproval.id, 'approved')
      } else if (e.key === 'n' && pendingApproval) {
        resolveApproval('offsite', pendingApproval.id, 'rejected')
      } else if (e.key === 'i') {
        setMode('steer')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    session,
    mode,
    selectedFeedIndex,
    pendingApproval,
    resolveApproval,
    submitSteer,
    setSteerDraft,
    setSelectedFeedIndex,
  ])

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--color-text-tertiary)]">
        Loading TUI…
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col bg-[var(--color-bg)] font-mono text-[12px]">
      {/* CRT vignette - dark themes only */}
      {theme.isDark && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
          }}
        />
      )}

      <div className="relative z-20 flex items-center justify-between border-b border-[var(--color-hairline)] px-3 py-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[var(--color-accent)]">
            ORRERY
          </Link>
          <span className="text-[var(--color-text-tertiary)]">tui</span>
          <span className="text-[var(--color-text-secondary)]">
            {session.meta.agentName} · {session.meta.taskTitle}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)]">
          <span className="hidden sm:inline">
            <Keycap>j</Keycap>/<Keycap>k</Keycap> nav
          </span>
          <span className="hidden md:inline">
            <Keycap>↵</Keycap> expand
          </span>
          <span className="hidden sm:inline">
            <Keycap>y</Keycap>/<Keycap>n</Keycap> approve
          </span>
          <span className="hidden md:inline">
            <Keycap>i</Keycap> steer
          </span>
          <Link to="/console" className="text-[var(--color-accent)]">
            console
          </Link>
          <Link to="/rosetta" className="text-[var(--color-accent)]">
            rosetta
          </Link>
          <ThemeSwitcher compact />
        </div>
      </div>

      <div className="relative z-20 grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr_200px]">
        {/* Plan panel */}
        <aside className="hidden overflow-y-auto border-r border-[var(--color-hairline)] p-3 lg:block">
          <pre className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
{`┌─ PLAN SPINE ${'─'.repeat(8)}┐
${session.plan
  .map((s, i) => {
    const mark =
      s.status === 'done' ? '✓' : s.status === 'active' ? '▸' : s.status === 'blocked' ? '!' : '·'
    return `│ ${mark} ${String(i + 1).padStart(2, '0')} ${s.label.slice(0, 22).padEnd(22)}│`
  })
  .join('\n')}
└${'─'.repeat(34)}┘`}
          </pre>
          {session.planRevisionReason && (
            <p className="mt-3 text-[11px] text-[var(--color-accent)]">
              ~ revised: {session.planRevisionReason}
            </p>
          )}
        </aside>

        {/* Stream */}
        <div className="flex min-h-0 flex-col">
          <div className="border-b border-[var(--color-hairline)] px-3 py-2">
            <p className="thought truncate text-[13px] text-[var(--color-text-secondary)]">
              {session.currentThought || '-'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <pre className="whitespace-pre-wrap text-[12px] leading-relaxed">
              {session.feed.map((item, index) => {
                const sel = index === selectedFeedIndex
                const exp = expanded.has(item.id)
                const prefix = sel ? '▸' : ' '
                const t = formatVirtualTime(item.at)
                let line = ''
                switch (item.kind) {
                  case 'thought':
                    line = `${prefix} ${t}  ${item.text}`
                    break
                  case 'tool':
                    line = `${prefix} ${t}  [${item.tool.name}] ${item.tool.intent}${
                      exp && item.tool.output ? `\n         ${item.tool.output.trim()}` : ''
                    }${item.tool.resultChip ? ` → ${item.tool.resultChip}` : ''}`
                    break
                  case 'approval':
                    line = `${prefix} ${t}  APPROVAL ${item.approval.status.toUpperCase()} · ${item.approval.title}${
                      exp
                        ? `\n         ${item.approval.summary}\n         ${item.approval.evidence.map((e) => `· ${e}`).join('\n         ')}`
                        : ''
                    }`
                    break
                  case 'artifact':
                    line = `${prefix} ${t}  artifact:${item.artifact.kind} ${item.artifact.title}`
                    break
                  case 'memory':
                    line = `${prefix} ${t}  memory: ${item.memory.text}`
                    break
                  case 'skill':
                    line = `${prefix} ${t}  skill?: ${item.skill.name}`
                    break
                  case 'plan_revision':
                    line = `${prefix} ${t}  PLAN REVISED - ${item.reason}`
                    break
                  case 'steer':
                    line = `${prefix} ${t}  STEER · ${item.message}`
                    break
                  case 'notification':
                    line = `${prefix} ${t}  ! ${item.title}: ${item.body}`
                    break
                  default:
                    line = `${prefix} ${t}  ${item.kind === 'system' ? item.text : ''}`
                }
                return (
                  <div
                    key={item.id}
                    className={
                      sel
                        ? 'bg-[var(--color-accent-dim)] text-[var(--color-text)]'
                        : item.kind === 'thought'
                          ? 'thought text-[var(--color-text-secondary)]'
                          : 'text-[var(--color-text-secondary)]'
                    }
                  >
                    {line}
                  </div>
                )
              })}
              <span className="cursor-block text-[var(--color-accent)]" />
            </pre>
          </div>

          {pendingApproval && (
            <div className="border-t border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)] px-3 py-2 text-[var(--color-danger)]">
              <div>
                [y/n] {pendingApproval.title}
                {pendingApproval.costUsd != null && (
                  <span className="tabular"> · ${pendingApproval.costUsd.toLocaleString()}</span>
                )}
              </div>
              <div className="text-[11px] text-[var(--color-text-secondary)]">
                {pendingApproval.summary}
              </div>
            </div>
          )}

          {mode === 'steer' && (
            <div className="border-t border-[var(--color-accent)]/40 bg-[var(--color-accent-dim)] px-3 py-2">
              <span className="text-[var(--color-accent)]">steer&gt; </span>
              <input
                autoFocus
                value={steerDraft}
                onChange={(e) => setSteerDraft(e.target.value)}
                className="w-[70%] bg-transparent outline-none"
                placeholder="fold into plan…"
              />
            </div>
          )}
        </div>

        {/* Artifacts */}
        <aside className="hidden overflow-y-auto border-l border-[var(--color-hairline)] p-3 lg:block">
          <pre className="text-[11px] text-[var(--color-text-secondary)]">
{`┌─ ARTIFACTS ${'─'.repeat(6)}┐
${
  session.artifacts.length === 0
    ? '│ (empty)                   │'
    : session.artifacts
        .map((a) => `│ ${a.kind.slice(0, 8).padEnd(8)} ${a.title.slice(0, 14).padEnd(14)}│`)
        .join('\n')
}
└${'─'.repeat(28)}┘`}
          </pre>
          <div className="mt-4 text-[10px] text-[var(--color-text-tertiary)]">
            cost{' '}
            <span className="tabular text-[var(--color-accent)]">
              ${session.meta.costUsd.toFixed(2)}
            </span>
          </div>
        </aside>
      </div>

      <div className="relative z-20">
        <DemoClock compact />
      </div>

      {awayRecapVisible && session.recap && (
        <AwayRecap recap={session.recap} onDismiss={dismissRecap} />
      )}
    </div>
  )
}
