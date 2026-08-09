import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { OrreryScene } from '../components/orrery/OrreryScene'
import { Button, Chip, Hairline, SectionLabel } from '../kit/primitives'
import { useActiveTheme } from '../kit/theme'

export function LandingPage() {
  const theme = useActiveTheme()
  const heroRef = useRef<HTMLElement>(null)

  const onHeroPointer = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100
    el.style.setProperty('--mx', `${x}%`)
    el.style.setProperty('--my', `${y}%`)
  }, [])

  return (
    <div>
      {/* Living hero */}
      <section
        ref={heroRef}
        onPointerMove={onHeroPointer}
        className="spotlight relative border-b border-[var(--color-hairline)]"
      >
        <div className="relative mx-auto grid min-h-[85vh] max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="graticule relative flex flex-col justify-center px-4 py-10 sm:px-6 lg:py-16">
            <div>
              <SectionLabel>Design exploration</SectionLabel>
              <h1 className="display mt-3 text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">
                An agent is not a chat.
                <br />
                <span className="text-[var(--color-accent)]">It is a process you supervise.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                ORRERY is a mission-control interface for autonomous agents. One event stream, five
                surfaces: technical console, Rosetta (plain language), terminal TUI, mobile companion,
                and a living orbital instrument. Altitude is adjustable. The underlying work is not.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/rosetta">
                  <Button variant="primary">Open Rosetta</Button>
                </Link>
                <Link to="/console">
                  <Button variant="outline">Technical console</Button>
                </Link>
                <Link to="/observatory">
                  <Button variant="ghost">Observatory</Button>
                </Link>
                <Link to="/patterns">
                  <Button variant="ghost">Patterns</Button>
                </Link>
              </div>
              <p className="mt-6 max-w-md text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
                The orrery is live. Linger and an orbit will halt when an agent needs approval.
                Stillness means you are needed. Click a planet to enter that session.
              </p>
            </div>
          </div>

          <div className="relative flex h-full min-h-[50vh] flex-col border-t border-[var(--color-hairline)] bg-[var(--color-bg)]/40 lg:border-t-0 lg:border-l">
            <div className="relative min-h-[50vh] flex-1 lg:min-h-[calc(85vh-2rem)]">
              <OrreryScene variant="hero" />
            </div>
            <div className="border-t border-[var(--color-hairline)] px-4 py-2 text-[10px] text-[var(--color-text-tertiary)]">
              Live: these are the same sessions you will supervise inside ·{' '}
              <Link
                to="/observatory"
                className="underline-slide text-[var(--color-accent)]"
              >
                full observatory
              </Link>
            </div>
          </div>
        </div>
        {/* Last child, above the grid — cannot be clipped by column stacking contexts */}
        <div className="hero-torch" aria-hidden />
      </section>

      <div className="relative z-[1] mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <SurfaceCard
            label="01 · Web"
            title="Mission console"
            body="Fleet triage, plan spine, tool cards, approval gates, artifact ledger. Supervision at desk scale."
            to="/console"
          />
          <SurfaceCard
            label="02 · Rosetta"
            title="Plain-language console"
            body="Every action rendered as a plain sentence. Same agent, same stream. Technical truth one gesture away."
            to="/rosetta"
          />
          <SurfaceCard
            label="03 · Terminal"
            title="Instrument TUI"
            body="Eighty-column feel, box-drawing panels, keyboard-native approvals. The agent's native habitat."
            to="/terminal"
          />
          <SurfaceCard
            label="04 · Mobile"
            title="Companion"
            body="Notification-driven. Hold-to-confirm a purchase from your pocket while the agent runs elsewhere."
            to="/mobile"
          />
          <SurfaceCard
            label="05 · Observatory"
            title="Ambient supervision"
            body="Leave it on the wall. Motion is health. Stillness means you are needed."
            to="/observatory"
          />
        </div>

        <Hairline className="my-12" />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionLabel>Art direction</SectionLabel>
            <h2 className="display mt-2 text-2xl">Tokens over literals</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              Console, TUI, companion, and living orrery all paint from one token registry. Seventeen
              skins swap colors and fonts at runtime. Flat surfaces,
              hairline borders, box-drawing structure. Every mark bound to real session state. Press{' '}
              <span className="text-[var(--color-text)]">t</span> to cycle themes; currently{' '}
              <span className="text-[var(--color-accent)]">{theme.name}</span>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Swatch token="--color-bg" label="bg" />
              <Swatch token="--color-surface" label="surface" />
              <Swatch token="--color-text" label="text" />
              <Swatch token="--color-accent" label="accent" />
              <Swatch token="--color-danger" label="risk" />
              <Swatch token="--color-success" label="ok" />
            </div>
          </div>
          <div className="glint border border-[var(--color-hairline)] bg-[var(--color-surface)]/90 p-5">
            <SectionLabel>Thesis</SectionLabel>
            <p className="thought mt-3 text-[18px] leading-relaxed text-[var(--color-text)]">
              Chat is a transcript. Supervision is a control surface: plans, tools, gates, artifacts,
              and the scarce resource of human attention.
            </p>
            <Link
              to="/study"
              className="underline-slide mt-4 inline-block text-[12px] text-[var(--color-accent)]"
            >
              Read the case study →
            </Link>
          </div>
        </div>

        <Hairline className="my-12" />

        <div>
          <SectionLabel>Eleven named patterns</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'Plan Spine',
              'Reasoning Ticker',
              'Tool Cards',
              'Approval Gates',
              'While You Were Away',
              'Interrupt & Steer',
              'Artifact Ledger',
              'Memory & Skill Moments',
              'Fleet Triage',
              'Ambient Supervision',
              'Show the Work',
            ].map((name) => (
              <Chip
                key={name}
                tone={
                  name === 'Show the Work' || name === 'Ambient Supervision' ? 'accent' : 'default'
                }
                className="glint"
              >
                {name}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SurfaceCard({
  label,
  title,
  body,
  to,
}: {
  label: string
  title: string
  body: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="sheen glint block border border-[var(--color-hairline)] bg-[var(--color-surface)]/90 p-4"
    >
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </div>
      <h3 className="mt-2 text-[15px] text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
    </Link>
  )
}

function Swatch({ token, label }: { token: string; label: string }) {
  const theme = useActiveTheme()
  const value = theme.tokens[token as keyof typeof theme.tokens] ?? ''
  return (
    <div className="glint flex items-center gap-2 border border-[var(--color-hairline)] bg-[var(--color-surface)]/80 px-2 py-1">
      <span
        className="size-3 border border-[var(--color-hairline)]"
        style={{ background: `var(${token})` }}
      />
      <span className="tabular text-[10px] text-[var(--color-text-tertiary)]">
        {label} {value}
      </span>
    </div>
  )
}
