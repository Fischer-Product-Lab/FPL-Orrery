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
                className="text-[13px] text-[var(--color-text)] hover:text-[var(--color-accent)]"
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
        <h2 className="display text-2xl text-[var(--color-accent)]">Translated to Hermes</h2>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          ORRERY is not a Hermes redesign. It is a pattern language aimed at the same problem space
          Hermes Agent and Nous Portal occupy. A mapping:
        </p>
        <ul className="space-y-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          <li>
            <strong className="text-[var(--color-text)]">Approval Gates</strong> → Hermes TUI modal
            overlays; extend with Portal credit cost and hold-to-confirm for destructive Tool
            Gateway calls.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">While You Were Away</strong> → Hermes Cloud
            / Daytona / Modal agents checked later from Telegram or the web dashboard. Re-entry needs
            a digest, not a log dump.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Memory & Skill Moments</strong> → Hermes's
            learning loop (skill creation, self-improvement, user modeling) made visible and
            correctable.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Fleet Triage</strong> → cron automations +
            subagents + multiple cloud instances ranked by who needs the human.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Tool Cards</strong> → streaming tool output
            in CLI/TUI with risk borders for shell and purchase tools.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Plan Spine / Interrupt & Steer</strong> →
            Hermes's interrupt-and-redirect made structural across surfaces.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Ambient Supervision</strong> → a wall-display
            mode for Hermes Cloud instances and cron fleets. The idle dashboard's next form, and a
            complement to checking in from Telegram.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Show the Work / intelligence for all</strong>{' '}
            → non-technical operators supervising Hermes Cloud agents from the dashboard or Telegram.
            Same learning-loop agent, readable by everyone in the household or team. Plain language by
            default; full technical truth one gesture away.
          </li>
        </ul>
      </section>

      <Hairline className="my-10" />

      <section className="space-y-3">
        <SectionLabel>Colophon</SectionLabel>
        <p className="text-[12px] leading-relaxed text-[var(--color-text-tertiary)]">
          Stack: Vite, React 19, TypeScript, Tailwind CSS v4, Zustand, React Router, Canvas 2D
          orrery. Theme system: nine skins from one TypeScript token registry (Observatory, Ayu
          Darkvenom, Dark Phoenix, Ethereal Omarchy, Material, Midnight, Nousromancer, Tokyo Night,
          Everforest Light). Colors and fonts apply as CSS custom properties; the canvas recolors via
          getComputedStyle. Press <code className="text-[var(--color-accent)]">t</code> to cycle.
          Default fonts: Newsreader + IBM Plex Mono. No backend: sessions are scripted and played on a
          virtual clock. Fictional product; Hermes and Nous Portal referenced only in this case-study
          mapping. Process: thesis → art direction → event schema → scripts → five surfaces → pattern
          language → Ambient Supervision → Rosetta / Show the Work → tokens-over-literals themes.
          Eleven named patterns.
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
