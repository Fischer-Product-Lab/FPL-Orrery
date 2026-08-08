import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BoxFrame, Chip, SectionLabel } from '../kit/primitives'
import { PlanSpine } from '../components/patterns/PlanSpine'
import { ReasoningTicker } from '../components/patterns/ReasoningTicker'
import { ToolCard } from '../components/patterns/ToolCard'
import { ApprovalGate } from '../components/patterns/ApprovalGate'
import { ArtifactLedger } from '../components/patterns/ArtifactLedger'
import { MemoryMoment, SkillMoment } from '../components/patterns/MemorySkill'
import { FleetTriage } from '../components/patterns/FleetTriage'
import { OrreryScene } from '../components/orrery/OrreryScene'
import type { ToolCall } from '../engine/types'
import { FriendlyToolBody } from '../surfaces/rosetta/RosettaPage'
import { toolSentence } from '../surfaces/rosetta/translate'
import { getPattern, patterns } from './registry'
import { getSessionList, useDemoStore } from '../engine/store'

export function PatternsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <SectionLabel>Pattern library</SectionLabel>
      <h1 className="display mt-2 text-3xl text-[var(--color-text)]">
        Eleven patterns for supervising agents
      </h1>
      <p className="mt-3 max-w-2xl text-[13px] text-[var(--color-text-secondary)]">
        Each pattern is named, documented, and rendered live from the same session store that
        powers the console, Rosetta, terminal, mobile, and Observatory.
      </p>
      <ol className="mt-8 divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)]">
        {patterns.map((p, i) => (
          <li key={p.id}>
            <Link
              to={`/patterns/${p.id}`}
              className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-surface)]"
            >
              <span className="tabular text-[11px] text-[var(--color-text-tertiary)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="text-[14px] text-[var(--color-text)]">{p.name}</div>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">{p.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function PatternDetailPage() {
  const { id } = useParams()
  const pattern = id ? getPattern(id) : undefined
  const session = useDemoStore((s) => s.sessions['offsite'])
  const sessions = useDemoStore((s) => s.sessions)
  const list = useMemo(() => getSessionList(sessions), [sessions])

  if (!pattern) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--color-text-tertiary)]">
        Pattern not found. <Link to="/patterns" className="text-[var(--color-accent)]">Back</Link>
      </div>
    )
  }

  const tool = session ? Object.values(session.tools)[0] : null
  const approval = session ? Object.values(session.approvals)[0] : null
  const memory = session?.memories[0]
  const skill = session?.skills[0]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/patterns" className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]">
        ← Pattern library
      </Link>
      <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        Pattern
      </div>
      <h1 className="display mt-1 text-3xl">{pattern.name}</h1>
      <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{pattern.tagline}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <DocBlock title="Definition" body={pattern.definition} />
          <DocBlock title="When to use" body={pattern.when} />
          <div>
            <SectionLabel>Anatomy</SectionLabel>
            <ul className="mt-2 space-y-1 text-[12px] text-[var(--color-text-secondary)]">
              {pattern.anatomy.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>States</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pattern.states.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-[var(--color-success)]/30 bg-[var(--color-success-dim)] px-3 py-2">
              <SectionLabel>Do</SectionLabel>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{pattern.doExample}</p>
            </div>
            <div className="border border-[var(--color-danger)]/30 bg-[var(--color-danger-dim)] px-3 py-2">
              <SectionLabel>Don&apos;t</SectionLabel>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{pattern.dontExample}</p>
            </div>
          </div>
          <DocBlock title="Translated to Hermes" body={pattern.hermesMap} accent />
        </section>

        <section className="space-y-4">
          <SectionLabel>Live cross-surface strip</SectionLabel>
          <BoxFrame title="Web console">
            <div className="p-3">
              {pattern.id === 'plan-spine' && session && (
                <PlanSpine steps={session.plan} revisionReason={session.planRevisionReason} diff={session.planDiff} compact />
              )}
              {pattern.id === 'reasoning-ticker' && session && (
                <ReasoningTicker current={session.currentThought} history={session.thoughts} />
              )}
              {pattern.id === 'tool-cards' && tool && <ToolCard tool={tool} />}
              {pattern.id === 'approval-gates' && approval && (
                <ApprovalGate approval={approval} onResolve={() => undefined} />
              )}
              {pattern.id === 'while-you-were-away' && (
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  Use <Chip tone="accent">skip 4h</Chip> on any surface to generate a recap digest.
                </p>
              )}
              {pattern.id === 'interrupt-steer' && (
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  Open the console steer input or press <Chip>i</Chip> in the terminal.
                </p>
              )}
              {pattern.id === 'artifact-ledger' && session && (
                <ArtifactLedger artifacts={session.artifacts} />
              )}
              {pattern.id === 'memory-skill' && (
                <div className="space-y-2">
                  {memory && <MemoryMoment memory={memory} />}
                  {skill && <SkillMoment skill={skill} />}
                  {!memory && !skill && (
                    <p className="text-[12px] text-[var(--color-text-tertiary)]">
                      Play the offsite session to the end to surface memory and skill moments.
                    </p>
                  )}
                </div>
              )}
              {pattern.id === 'fleet-triage' && (
                <FleetTriage sessions={list} activeId="offsite" onSelect={() => undefined} />
              )}
              {pattern.id === 'ambient-supervision' && (
                <div className="h-56 border border-[var(--color-hairline)]">
                  <OrreryScene variant="compact" showLegend interactive={false} />
                </div>
              )}
              {pattern.id === 'show-the-work' && tool && session && (
                <ShowTheWorkStrip
                  agentName={session.meta.agentName}
                  tool={tool}
                />
              )}
            </div>
          </BoxFrame>

          {pattern.id === 'ambient-supervision' ? (
            <>
              <BoxFrame title="Observatory (full)">
                <div className="p-3 text-[12px] text-[var(--color-text-secondary)]">
                  Full-screen ambient mode at{' '}
                  <Link to="/observatory" className="text-[var(--color-accent)]">
                    /observatory
                  </Link>
                  . Same canvas, wall-scale. Stillness = needs you.
                </div>
              </BoxFrame>
              <BoxFrame title="Landing hero">
                <div className="p-3 text-[12px] text-[var(--color-text-secondary)]">
                  The index page mounts the same live instrument - a visitor who lingers sees an
                  orbit halt when approval fires.
                </div>
              </BoxFrame>
            </>
          ) : pattern.id === 'show-the-work' ? (
            <>
              <BoxFrame title="Rosetta">
                <div className="p-3 text-[12px] text-[var(--color-text-secondary)]">
                  Full plain-language console at{' '}
                  <Link to="/rosetta" className="text-[var(--color-accent)]">
                    /rosetta
                  </Link>
                  . Same session store - plain language by default.
                </div>
              </BoxFrame>
              <BoxFrame title="Technical console">
                <div className="p-3 text-[12px] text-[var(--color-text-secondary)]">
                  Side-by-side above: friendly moment vs. raw tool card. One stream, two altitudes.
                </div>
              </BoxFrame>
            </>
          ) : (
            <>
              <BoxFrame title="Terminal TUI">
                <pre className="overflow-x-auto p-3 text-[11px] text-[var(--color-text-secondary)]">
{terminalSketch(pattern.id, session?.currentThought ?? '…')}
                </pre>
              </BoxFrame>

              <BoxFrame title="Mobile companion">
                <div className="p-3 text-[12px] text-[var(--color-text-secondary)]">
                  {mobileSketch(pattern.id)}
                </div>
              </BoxFrame>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function DocBlock({
  title,
  body,
  accent,
}: {
  title: string
  body: string
  accent?: boolean
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <p
        className={`mt-2 text-[13px] leading-relaxed ${
          accent ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
        }`}
      >
        {body}
      </p>
    </div>
  )
}

function terminalSketch(id: string, thought: string): string {
  switch (id) {
    case 'plan-spine':
      return `┌─ PLAN SPINE ────────────┐
│ ▸ 03 Compare flights…   │
│ · 04 Draft itinerary    │
└─────────────────────────┘`
    case 'reasoning-ticker':
      return `┊ ${thought.slice(0, 48)}…`
    case 'tool-cards':
      return `[web.search] Find quiet research retreat venues
  → 3 shortlisted`
    case 'approval-gates':
      return `[y/n] Authorize flight + lodging · $2,612`
    case 'while-you-were-away':
      return `WHILE YOU WERE AWAY
  decided  3 · produced  2 · waiting  1`
    case 'interrupt-steer':
      return `steer> prefer venues with whiteboards
  STEER · folding into active plan`
    case 'artifact-ledger':
      return `┌─ ARTIFACTS ──────┐
│ document Itinerary│
│ receipt  Bookings │
└───────────────────┘`
    case 'memory-skill':
      return `memory: prefer morning flights
skill?: Offsite Planning  [save/dismiss]`
    case 'fleet-triage':
      return `! needs you  Plan team offsite
▸ running    Fine-tune support
  done       Fix nightly build`
    case 'ambient-supervision':
      return `○ you
   ◐ ring  · running trail
  ● HALTED ── NEEDS YOU`
    case 'show-the-work':
      return `Kepler searched the web for retreat venues
  → 3 good options
  [how?]  web.search · …`
    default:
      return '-'
  }
}

function mobileSketch(id: string): string {
  switch (id) {
    case 'approval-gates':
      return 'Push notification → context sheet with plan position, evidence, hold-to-confirm.'
    case 'while-you-were-away':
      return 'Recap card on open: decided / produced / waiting - one thumb away from resume.'
    case 'fleet-triage':
      return 'Badge count on "needs you"; quiet agents collapse to a progress meter.'
    case 'memory-skill':
      return 'Inline "Noted: …" with Correct; skill proposal as a saveable card.'
    case 'ambient-supervision':
      return 'Not a phone surface - a wall or desk display. Mobile stays notification-driven; the Observatory holds the long gaze.'
    case 'show-the-work':
      return 'Friendly push copy first; "Show technical detail" reveals the same tool card a developer would see.'
    default:
      return 'Glanceable status + deep-link into the matching console pattern when you sit down.'
  }
}

function ShowTheWorkStrip({
  agentName,
  tool,
}: {
  agentName: string
  tool: ToolCall
}) {
  const [workOpen, setWorkOpen] = useState(false)
  const sentence = toolSentence(agentName, tool)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="border border-[var(--color-hairline)] p-3">
        <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
          Rosetta · plain language
        </div>
        <FriendlyToolBody
          sentence={sentence}
          tool={tool}
          workOpen={workOpen}
          onToggleWork={() => setWorkOpen((v) => !v)}
        />
      </div>
      <div className="border border-[var(--color-hairline)] p-3">
        <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
          Console · raw tool card
        </div>
        <ToolCard tool={tool} />
      </div>
    </div>
  )
}
