# Design notes

Short record of the decisions that are easy to lose once the demo is pretty.

## Thesis

An agent is a long-running process. The human's job is supervision: knowing the plan, authorizing risk, collecting outputs, correcting what the agent inferred. Chat is a bad container for that job because it flattens structure into chronology.

## Five altitudes, one stream

| Altitude | Surface | Operator |
| --- | --- | --- |
| Dense / technical | Console | Someone who wants invocations and cost |
| Plain / reversible | Rosetta | Someone who wants sentences first |
| Keyboard / habitat | Terminal | Someone already in a TUI |
| Pocket / interrupt | Mobile | Someone away from the desk |
| Peripheral / ambient | Observatory | Someone who should notice without reading |

The hard constraint: the same `approval.requested` event must remain recognizable in all five. If a surface invents a second meaning for "needs you," the system splits.

## Rosetta

Named for the stone that made one decree readable in more than one script. The point is not "simplify until safe." The point is:

1. default to a sentence a non-specialist can act on
2. keep the technical layer one reversible gesture away
3. never ship a dumbed-down fork that deletes evidence

`translate.ts` is the quotable claim: translation is a pure function of the event stream. Rosetta v2 adds an altitude control (Simple / Detailed / Technical), a pinned needs-you dock, and structured work panels so the technical layer is richer, not louder.

## Type

Two voices, deliberately:

- **Newsreader italic** for agent reasoning (provisional, human-shaped)
- **IBM Plex Mono** for machine truth (invocations, logs, costs, labels)

Accent is scarce. Phosphor amber means attention or activity. Danger red is for gates and destructive risk, not decoration.

## Motion

Phosphor decay on entrances. Durations pinned to 120 / 200 / 320 / 600ms. No bounce, no "delight" that competes with triage.

In the Observatory, motion is the healthy baseline. **Stillness is reserved for "needs you."** If everything dances when something is wrong, the signal dies.

## Tokens over literals

Fifteen skins, one registry. The demo has to survive a theme swap without hunting hex codes. That discipline also keeps the Observatory honest: it cannot cheat with a private palette.

## What we refused

- Glassmorphism / glow stacks / purple-on-white defaults
- Hero cards stuffed with stats and promo chips
- Separate "simple mode" product that hides tool I/O forever
- Auto-approving spend because the prompt said "book it"
- Animating the wall display for atmosphere instead of state

## Hermes coda

ORRERY is not a Hermes redesign. The pattern list is a proposal for the same problem space: Tool Gateway risk, Cloud agents checked later from Telegram, learning-loop memory and skills, fleets of cron/subagents. Mapping lives on `/study` and in each pattern's `hermesMap` field. Keep the distinction clear in conversation: this is a design argument, not a product claim.
