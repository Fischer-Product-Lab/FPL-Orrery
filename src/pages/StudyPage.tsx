import { Link } from 'react-router-dom'
import { Hairline, SectionLabel } from '../kit/primitives'
import { patterns } from '../patterns/registry'

export function StudyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <SectionLabel>Case study</SectionLabel>
      <h1 className="display mt-2 text-4xl text-[var(--color-text)]">
        Designing supervision for autonomous agents
      </h1>
      <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        ORRERY is a fictional product built as a portfolio exploration for agentic interface design.
        It asks one question: if an agent is a long-running process (possibly on a machine you never
        SSH into), what should the human's control surface look and feel like?
      </p>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>01 · Problem framing</SectionLabel>
        <h2 className="display text-2xl">Why chat is the wrong container</h2>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          Chat interfaces optimized for turn-taking. Agentic work is asynchronous, multi-step,
          tool-heavy, and punctuated by rare human decisions. A transcript buries plan state, tool
          anatomy, cost, and provenance under scroll. Supervision needs structure: a spine for the
          plan, cards for tools, gates for risk, a ledger for outputs, and triage when more than one
          agent is alive.
        </p>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>02 · Information architecture</SectionLabel>
        <h2 className="display text-2xl">One stream, five renderings</h2>
        <pre className="overflow-x-auto border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
{`scripted sessions
      │
      ▼
 playback engine  ←── virtual demo clock
      │
      ▼
 session store (Zustand)
      │
      ├── web console   (fleet · spine · feed · ledger)
      ├── rosetta       (plain language · show the work)
      ├── terminal TUI  (keyboard · box-drawing · y/n)
      ├── mobile        (notifications · hold-to-confirm)
      └── observatory   (ambient orbits · stillness = ask)`}
        </pre>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          Cross-surface consistency is the hard design problem. The same{' '}
          <code className="text-[var(--color-accent)]">approval.requested</code> event becomes a
          hold-to-confirm sheet on mobile, a modal gate on web, a decision card in Rosetta, a{' '}
          <code className="text-[var(--color-accent)]">[y/n]</code> prompt in the TUI, and a
          hard-stopped orbit with a conjunction beam in the Observatory. Pre-attentive, readable
          across a room. Expertise is a rendering choice, not a different product.
        </p>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>03 · Type & color</SectionLabel>
        <h2 className="display text-2xl">Two voices</h2>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          <span className="thought text-[var(--color-text)]">Newsreader italic</span> carries the
          agent's reasoning: human, provisional, reflective.{' '}
          <span className="text-[var(--color-text)]">IBM Plex Mono</span> carries machine truth:
          invocations, logs, costs, labels. Phosphor amber is the sole accent (attention, activity,
          affirmation). Danger red is reserved for gates and destructive risk. The palette is dark by
          design; agents run at night.
        </p>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>04 · Motion</SectionLabel>
        <h2 className="display text-2xl">Phosphor, not bounce</h2>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          Entrances use a brief brightness decay (phosphor-in). Durations lock to 120 / 200 / 320 /
          600ms. Easing is standard instrumental, not playful. The Observatory extends this: phosphor
          trails via canvas frame decay, spring-eased orbital progress, and a hard rule that{' '}
          <strong className="text-[var(--color-text)]">stillness is reserved for "needs you."</strong>{' '}
          The rAF loop reads the store directly (zero React re-renders at 60fps).{' '}
          <code className="text-[var(--color-accent)]">prefers-reduced-motion</code> keeps accurate
          static positions without trails or pulses.
        </p>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>05 · Pattern index</SectionLabel>
        <h2 className="display text-2xl">A language for agentic UX</h2>
        <ul className="mt-2 space-y-2">
          {patterns.map((p) => (
            <li key={p.id}>
              <Link
                to={`/patterns/${p.id}`}
                className="underline-slide text-[13px] text-[var(--color-text)] hover:text-[var(--color-accent)]"
              >
                {p.name}
              </Link>
              <span className="text-[12px] text-[var(--color-text-tertiary)]"> · {p.tagline}</span>
            </li>
          ))}
        </ul>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-4">
        <SectionLabel>06 · Coda</SectionLabel>
        <h2 className="display text-2xl text-[var(--color-accent)]">What this is for</h2>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          ORRERY is a pattern language for supervising long-running agents: the same work, readable at
          different altitudes. The patterns are meant to travel into real operator surfaces, not to
          stay as a demo aesthetic. Where they land in practice:
        </p>
        <ul className="space-y-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          <li>
            <strong className="text-[var(--color-text)]">Approval Gates</strong> → when spend or
            irreversible action is on the table, the human gets evidence, cost, and a deliberate
            confirm, not a bare yes/no buried in scroll.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">While You Were Away</strong> → agents that
            keep working overnight or on remote machines need a digest on return, not a log dump.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Memory & Skill Moments</strong> → when an
            agent learns a preference or proposes a reusable skill, that inference must be visible and
            correctable.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Fleet Triage</strong> → when many agents run
            at once (cron, subagents, parallel jobs), attention ranks by who needs the human, not by
            recency alone.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Tool Cards</strong> → every tool call shows
            intent, invocation, and result, with risk made obvious for shell, purchase, and other
            high-stakes actions.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Plan Spine / Interrupt & Steer</strong> → the
            plan stays scannable while the run is alive, and the human can redirect without killing
            the process.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Ambient Supervision</strong> → for the hours
            you are not watching: motion means health, stillness means you are needed. A wall or desk
            display, not another feed to babysit.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Show the Work</strong> → plain language by
            default for anyone in the household or team; full technical truth one gesture away. Same
            agent, adjustable altitude.
          </li>
        </ul>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>Colophon</SectionLabel>
        <p className="text-[12px] leading-relaxed text-[var(--color-text-tertiary)]">
          Stack: Vite, React 19, TypeScript, Tailwind CSS v4, Zustand, React Router, Canvas 2D
          orrery. Theme system: fifteen skins from one TypeScript token registry (Observatory through
          Everforest Light, including Dracula Redefined, Neon City, Catppuccin, Gruvbox, Deep Dark
          Space, and Andromeda). Colors and fonts apply as CSS custom properties; the canvas recolors
          via getComputedStyle. Press <code className="text-[var(--color-accent)]">t</code> to cycle.
          Default fonts: Newsreader + IBM Plex Mono. No backend: sessions are scripted and played on a
          virtual clock. Fictional product built as a design exploration of agent supervision. Process:
          thesis → art direction → event schema → scripts → five surfaces → pattern language → Ambient
          Supervision → Rosetta / Show the Work → tokens-over-literals themes. Eleven named patterns.
        </p>
        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          <Link to="/rosetta" className="text-[var(--color-accent)]">
            Open Rosetta
          </Link>{' '}
          ·{' '}
          <Link to="/observatory" className="text-[var(--color-accent)]">
            Open the observatory
          </Link>{' '}
          ·{' '}
          <Link to="/console" className="text-[var(--color-accent)]">
            Launch the console
          </Link>{' '}
          ·{' '}
          <Link to="/patterns" className="text-[var(--color-accent)]">
            Browse patterns
          </Link>
        </p>
      </section>
    </article>
  )
}
