# ORRERY

**Mission control for autonomous agents.**

**Live:** [orrery-orpin.vercel.app](https://orrery-orpin.vercel.app) · **Repo:** [Fischer-Product-Lab/FPL-Orrery](https://github.com/Fischer-Product-Lab/FPL-Orrery)

> An agent is not a chat. It is a process you supervise.

ORRERY is a portfolio design exploration: five surfaces reading one simulated event stream. Built to argue that agentic work needs supervision structure (plans, tools, gates, ledgers, triage), not a longer transcript.

This is a **fictional** product: a design exploration of how humans supervise long-running agents across desk, terminal, phone, wall, and plain language.

---

## Why this exists

Chat UIs optimize for turn-taking. Agents optimize for long-running, tool-heavy work punctuated by rare human decisions. A scrollback buries:

- where the plan currently is
- what tool was actually invoked
- what the spend or risk looks like
- what outputs already exist
- which of several agents needs you *now*

ORRERY treats those as first-class interface objects and asks what they look like on a desk, in a terminal, on a phone, on a wall, and in plain English.

---

## Surfaces

| Route | Surface | Job |
| --- | --- | --- |
| `/` | Landing | Live orrery hero + thesis |
| `/console` | Web mission control | Fleet triage, spine, feed, ledger |
| `/rosetta` | Rosetta | Plain-language console; technical truth one gesture away (`/guide` redirects here) |
| `/observatory` | Observatory | Ambient orbits; motion = health, stillness = needs you |
| `/terminal` | Instrument TUI | Keyboard-native, box-drawing, `y`/`n` |
| `/mobile` | Companion | Notification-driven; hold-to-confirm |
| `/patterns` | Pattern library | Eleven named patterns with live strips |
| `/study` | Case study | Problem, IA, type, motion, and where the patterns land |

All five operational surfaces share the same Zustand session store. Expertise is a rendering choice, not a fork of the product.

---

## Pattern language

1. **Plan Spine** - multi-step plan with revision diffs
2. **Reasoning Ticker** - collapsed thought stream
3. **Tool Cards** - intent → invocation → output → result
4. **Approval Gates** - evidence + cost; hold-to-confirm for money
5. **While You Were Away** - recap after time skip (`skip 4h`)
6. **Interrupt & Steer** - redirect mid-run without killing it
7. **Artifact Ledger** - outputs with provenance
8. **Memory & Skill Moments** - visible, correctable learning loop
9. **Fleet Triage** - rank sessions by who needs you
10. **Ambient Supervision** - Observatory encoding
11. **Show the Work** - Rosetta's pattern: plain first, technical one toggle away

---

## How the demo works

No backend. Three scripted sessions (`src/scripts/`) emit typed events on a **virtual clock**:

| Session | Agent | Why it's there |
| --- | --- | --- |
| Offsite | Kepler | Hero path: search → purchase approval → memory → skill |
| Nightly build | Ada | CI / code change / push approval |
| Fine-tune | Hypatia | Long-running job for Away Recap demos |

Playback controls (every surface):

- play / pause (`Space`)
- 1× / 8× / 32×
- jump to next event
- **skip 4h** (forces the Away Recap)

Terminal keys: `j`/`k` navigate · `Enter` expand · `y`/`n` approve · `i` steer · `t` cycle theme

Approvals in the scripts intentionally pause the clock until the operator acts. That is the point.

---

## Architecture (bones)

```
src/scripts/          timed event scripts (the "agents")
src/engine/           types, applyEvent, Zustand store + clock
src/components/       shared patterns + living OrreryScene
src/surfaces/         console · rosetta · terminal · mobile
src/pages/            landing · observatory · study
src/patterns/         registry + live pattern pages
src/kit/              tokens, themes, primitives
```

Data flow:

```
scripted sessions
      │
      ▼
 playback engine  ←── virtual demo clock
      │
      ▼
 session store (Zustand)
      │
      ├── console
      ├── rosetta   ← translate.ts (pure)
      ├── terminal
      ├── mobile
      └── observatory (canvas rAF reads store directly)
```

Rosetta's translation layer (`src/surfaces/rosetta/translate.ts`) is deliberately pure: same feed items in, plain sentences out. The Observatory canvas reads Zustand inside `requestAnimationFrame` so orbital motion does not re-render React at 60fps.

Deeper notes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/DESIGN.md](docs/DESIGN.md)

---

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Zustand · React Router · Canvas 2D

Default type: [Newsreader](https://fonts.google.com/specimen/Newsreader) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)

Seventeen themes from one token registry (`src/kit/themes.ts`). Observatory first; the rest alphabetical by name. Colors and fonts bind as CSS custom properties on `<html>`; the canvas recolors via `getComputedStyle`. Choice persists in `localStorage`. Press **`t`** to cycle.

| Theme | Mode | Accent / voice |
| --- | --- | --- |
| Observatory (default) | dark | phosphor amber · Newsreader + IBM Plex Mono |
| Andromeda | dark | nebula fuchsia · Sora + JetBrains Mono |
| Aura Spirit Dracula | dark | soft void purple · Manrope + Fira Code |
| Ayu Darkvenom | dark | venom green · Space Grotesk + JetBrains Mono |
| Catppuccin | dark | Mocha mauve · Nunito + JetBrains Mono |
| Dark Phoenix | dark | flame · Fraunces + Fira Code |
| Deep Dark Space | dark | starlight blue on near-black · Spectral + IBM Plex Mono |
| Dracula Redefined | dark | hotter pink on deeper void · Outfit + Fira Code |
| Ethereal Omarchy | dark | mist violet · Cormorant + Victor Mono |
| Gruvbox | dark | warm earth yellow · IBM Plex Serif + Inconsolata |
| Kanagawa Dragon | dark | ink-black, wave yellow · IBM Plex Sans + Mono |
| Material | dark | cyan on graphite · Roboto + Roboto Mono |
| Midnight | dark | moonlight · EB Garamond + DM Mono |
| Neon City | dark | magenta / cyan rain · Orbitron + Share Tech Mono |
| Nousromancer | dark | neon teal · Rajdhani + Space Mono |
| Tokyo Night | dark | storm blue · IBM Plex Sans + JetBrains Mono |
| Vesper | dark | near-black charcoal, warm gold · Inter + JetBrains Mono |

Art direction in short: precision instrument / observatory log. Tokens over literals. Hairline borders, box-drawing structure. No glassmorphism, decorative gradients, or template chrome. The orrery is line-work only; every mark is bound to state.

---

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

Deploy target is Vercel (`vercel.json` SPA rewrite). Production URL above.

---

## Reading order

If you have ten minutes:

1. Open [/rosetta](https://orrery-orpin.vercel.app/rosetta), play the offsite session, approve the purchase (hold-to-confirm)
2. Slide the altitude control to **Technical**, then open the same session in [/console](https://orrery-orpin.vercel.app/console)
3. Sit with [/observatory](https://orrery-orpin.vercel.app/observatory) until an orbit hard-stops
4. Skim [/patterns/show-the-work](https://orrery-orpin.vercel.app/patterns/show-the-work) and [/study](https://orrery-orpin.vercel.app/study)

---

## License / attribution

Portfolio work © Fischer Product Lab.
