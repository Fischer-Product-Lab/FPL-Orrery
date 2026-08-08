# Architecture

ORRERY has no API and no persistence. The "agents" are timed scripts. The interesting engineering is the shared session model and the rule that every surface is a view over that model.

## Event schema

Events live in `src/engine/types.ts`. Rough families:

- **Plan**: `plan.set`, `plan.revise`, step status changes
- **Thought**: reasoning lines for the ticker
- **Tool**: `tool.started` / `tool.progress` / `tool.finished` (intent, invocation, streaming output, result chip)
- **Approval**: `approval.requested` / resolved by the operator
- **Artifact / memory / skill**: outputs and learning-loop moments
- **Steer / notification / system**: operator interrupts and chrome

`applyEvent.ts` is a pure reducer: `(SessionState, Event) → SessionState`. The store wraps that reducer with the demo clock.

## Playback engine

`src/engine/store.ts` holds:

- `sessions: Record<id, SessionState>`
- `activeSessionId`
- virtual time (`virtualTimeMs`), speed, paused flag
- pending approvals that **freeze** further script advancement for that session until the human resolves them

Scripts are arrays of `{ id, type, t, sessionId, ...payload }` sorted by virtual time `t`. The clock advances `t`; when `t` crosses an event, it applies. This keeps demos deterministic and lets `skip 4h` synthesize an Away Recap from whatever happened in the gap.

## Surfaces as renderers

| Surface | Path | Notes |
| --- | --- | --- |
| Console | `src/surfaces/console` | Dense operator desk: fleet sidebar + session column |
| Rosetta | `src/surfaces/rosetta` | Plain-language view; `translate.ts` is a pure function of the feed |
| Terminal | `src/surfaces/terminal` | Faux TUI; keyboard map is the product |
| Mobile | `src/surfaces/mobile` | Notification stack + hold-to-confirm sheet |
| Observatory | `src/pages/ObservatoryPage` + `components/orrery` | Canvas instrument; rAF reads the store |

Rosetta is the clearest statement of the thesis: same store, different altitude. "Show the Work" disclosures flip a moment back to invocation and raw output without leaving the page.

## Living orrery

`OrreryScene.tsx` + `orreryMath.ts`:

- rings encode plan progress
- planets encode sessions
- phosphor trail = running
- hard-stop + conjunction beam = needs you

The canvas samples CSS variables each frame so theme switches recolor the instrument without a separate palette. `prefers-reduced-motion` keeps positions accurate and drops trails/pulses.

## Themes

`src/kit/themes.ts` is the single registry. Applying a theme sets custom properties on `<html>`. Components and the canvas both consume those tokens. No color literals in surface chrome (except where SVG/favicon assets are intentionally fixed).

## Why this shape

1. **One store** forces cross-surface consistency. If an approval cannot be expressed in the TUI and the Observatory, the model is wrong.
2. **Scripts over mocks** make time, pause-on-approval, and Away Recap real behaviors instead of screenshots.
3. **Pure translation** for Rosetta keeps the "intelligence for all" claim falsifiable: if the sentence is wrong, fix the function, not a parallel product.
