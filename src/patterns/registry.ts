export type PatternDef = {
  id: string
  name: string
  tagline: string
  definition: string
  when: string
  anatomy: string[]
  states: string[]
  doExample: string
  dontExample: string
  hermesMap: string
}

export const patterns: PatternDef[] = [
  {
    id: 'plan-spine',
    name: 'Plan Spine',
    tagline: 'A living multi-step plan with readable revision diffs.',
    definition:
      'The Plan Spine is the durable backbone of an agent session: an ordered list of steps with per-step state. When the agent re-plans, the spine shows what was added, removed, or changed - and why.',
    when:
      'Any multi-step or long-running task where the operator needs to know where the agent is, what remains, and when the strategy shifts.',
    anatomy: [
      'Ordered steps with status (pending / active / done / blocked)',
      'Revision banner with reason',
      'Step-level diff (+ added, − removed, ~ changed)',
    ],
    states: ['empty', 'planned', 'in progress', 'revised', 'complete'],
    doExample: 'Surface the reason for a replan next to the diff - never silent mutation.',
    dontExample: 'Replace the plan silently and hope the operator notices in the chat scroll.',
    hermesMap:
      'Hermes Agent already maintains session state and skills across turns. A Plan Spine would make multi-step TUI and dashboard runs scannable - especially when cron jobs or subagents revise their approach mid-flight.',
  },
  {
    id: 'reasoning-ticker',
    name: 'Reasoning Ticker',
    tagline: 'Thoughts collapsed to one line; expand for the full voice.',
    definition:
      'Agent reasoning is valuable but noisy. The ticker shows the latest thought as a single italic line; expansion reveals the full serif stream without forcing it into the primary feed.',
    when: 'Streaming reasoning, chain-of-thought, or narrated intent during tool use.',
    anatomy: ['Collapsed one-line ticker', 'Expand/collapse control', 'Full thought history panel'],
    states: ['idle', 'streaming', 'expanded', 'stale'],
    doExample: 'Keep machine truth (tool I/O) in mono; keep reasoning in a distinct voice.',
    dontExample: 'Dump every token of reasoning into the same column as tool output.',
    hermesMap:
      'Hermes TUI streams tool output and conversation. A ticker would keep reasoning glanceable in the classic CLI and modern TUI without drowning slash-command workflows.',
  },
  {
    id: 'tool-cards',
    name: 'Tool Cards',
    tagline: 'Intent → invocation → live output → result chip.',
    definition:
      'Each tool call is a structured card: why it was called, the exact invocation, streaming output, and a compact result chip. Risk tints the border for destructive calls.',
    when: 'Any tool-using agent - search, shell, browser, travel, train jobs.',
    anatomy: ['Intent line', 'Invocation (mono)', 'Streaming output pane', 'Result chip', 'Risk border'],
    states: ['running', 'done', 'failed'],
    doExample: 'Show the invocation string - operators debug what was actually called.',
    dontExample: 'Hide tool calls behind "Working…" spinners with no anatomy.',
    hermesMap:
      "Hermes ships 60+ tools and a Tool Gateway via Nous Portal. Tool Cards map cleanly onto streaming tool output in the TUI and the web dashboard's session monitor.",
  },
  {
    id: 'approval-gates',
    name: 'Approval Gates',
    tagline: 'Blocking human-in-the-loop with evidence and cost.',
    definition:
      'When the agent needs permission - especially for money or destructive actions - it presents a gate: summary, evidence, cost, risk grade. High-risk actions require hold-to-confirm.',
    when: 'Purchases, pushes to main, data deletion, irreversible infra changes.',
    anatomy: ['Title + summary', 'Evidence list', 'Cost chip', 'Risk grade', 'Approve / reject (hold for money)'],
    states: ['pending', 'approved', 'rejected', 'expired'],
    doExample: 'Attach evidence and cost to the decision - never a bare yes/no.',
    dontExample: 'Auto-proceed on spend because "the user said book a trip."',
    hermesMap:
      'Hermes TUI already uses modal approval overlays. Extending them with cost (Portal credits) and hold-to-confirm for destructive tool calls matches how Hermes Cloud and the Tool Gateway bill.',
  },
  {
    id: 'while-you-were-away',
    name: 'While You Were Away',
    tagline: 'A recap digest when you return to a long-running agent.',
    definition:
      'Agents that run for hours (or on remote VMs) outpace attention. On return - or after skipping ahead - show what was decided, what was produced, and what still waits on the operator.',
    when: 'Cron jobs, overnight training, cloud-hosted agents checked from chat later.',
    anatomy: ['Decided column', 'Produced column', 'Waiting on you column', 'Resume CTA'],
    states: ['fresh return', 'partial progress', 'blocked on approval'],
    doExample: 'Lead with what needs the human - bury routine progress.',
    dontExample: 'Force the operator to scroll six hours of logs to find the ask.',
    hermesMap:
      'Hermes runs on Daytona/Modal serverless and Hermes Cloud; people talk to it from Telegram while it works on a VM. Away-recap is the natural re-entry pattern for that lifestyle.',
  },
  {
    id: 'interrupt-steer',
    name: 'Interrupt & Steer',
    tagline: 'Redirect mid-run without killing the process.',
    definition:
      'Steering lets the operator inject guidance while the agent continues. The agent acknowledges and folds the instruction into the active plan rather than restarting from zero.',
    when: 'Preferences change mid-task; constraints tighten; operator sees a better path.',
    anatomy: ['Steer input', 'Acknowledgement event', 'Plan fold-in'],
    states: ['idle', 'steering', 'acknowledged'],
    doExample: 'Acknowledge in the feed so the operator knows the steer landed.',
    dontExample: 'Treat every message as a new chat that abandons in-flight work.',
    hermesMap:
      'Hermes CLI supports interrupt-and-redirect. This pattern makes that capability visible and cross-surface - same steer from console, TUI, or mobile.',
  },
  {
    id: 'artifact-ledger',
    name: 'Artifact Ledger',
    tagline: 'Every output pinned with provenance.',
    definition:
      'Artifacts (docs, diffs, receipts, models) live in a ledger with links back to the step and tool call that produced them - so outputs are findable without replaying the whole stream.',
    when: 'Any session that produces files, reports, patches, or confirmations.',
    anatomy: ['Kind chip', 'Title', 'Preview', 'Provenance (step + tool)'],
    states: ['empty', 'accumulating', 'final packet'],
    doExample: 'Keep provenance on every artifact - trust comes from lineage.',
    dontExample: 'Drop files into a blob store with no link to the decision that created them.',
    hermesMap:
      'Hermes sessions write to state.db and produce skills/memories. An artifact ledger would surface trajectory outputs for research and for operators reviewing cloud sessions.',
  },
  {
    id: 'memory-skill',
    name: 'Memory & Skill Moments',
    tagline: 'Surface what the agent learned - and let humans correct it.',
    definition:
      'When the agent notes a preference or proposes a reusable skill, surface it as a first-class moment with one-tap correction or save/dismiss. This makes the learning loop visible and steerable.',
    when: 'After complex tasks; when user preferences are inferred; when a workflow should become a skill.',
    anatomy: ['Memory note + correct', 'Skill proposal + save/dismiss'],
    states: ['noted', 'corrected', 'proposed', 'saved', 'dismissed'],
    doExample: 'Always allow correction - inferred memory is a hypothesis.',
    dontExample: 'Silently write preferences with no audit trail.',
    hermesMap:
      "Hermes's differentiator is the learning loop: skill creation, self-improvement, Honcho user modeling. Memory & Skill Moments are the UX for that loop.",
  },
  {
    id: 'fleet-triage',
    name: 'Fleet Triage',
    tagline: 'Rank concurrent sessions by who needs you now.',
    definition:
      'When multiple agents run in parallel, attention must be triaged: needs you now, running fine, done. The fleet list is sorted by urgency, not recency alone.',
    when: 'Multi-agent fleets, cron farms, org-wide Hermes Cloud instances.',
    anatomy: ['Session row', 'Triage chip', 'Agent + cost', 'Active highlight'],
    states: ['needs_you', 'running', 'idle', 'done'],
    doExample: 'Sort by urgency. A pending approval outranks a quietly finishing job.',
    dontExample: 'A flat chronological chat list across all agents.',
    hermesMap:
      'Hermes can schedule automations and spawn subagents; Portal hosts cloud instances. Fleet Triage is how an operator supervises more than one Hermes at a time.',
  },
  {
    id: 'ambient-supervision',
    name: 'Ambient Supervision',
    tagline: 'The Observatory - glanceable fleet awareness for the hours you are not watching.',
    definition:
      'Ambient Supervision is a peripheral-vision control surface. Agent sessions become orbits: motion means health, stillness means a question. Pre-attentive encodings (motion, color, alignment) carry triage without requiring the operator to read a feed. It is the interface for the hours when the agent does not need you - and the moment it does.',
    when:
      'Multi-agent fleets on a second monitor or wall display; long-running jobs; any context where continuous attention is wasteful but absence of attention is risky.',
    anatomy: [
      'Orbital rings = plan progress (solid / dashed)',
      'Planets = sessions (angle = progress)',
      'Phosphor trail = running health',
      'Hard-stop + conjunction beam = needs you',
      'Tool spark = active tool call',
      'Operator core = you',
    ],
    states: ['drifting', 'tooling', 'halted / needs you', 'settled / done'],
    doExample: 'Reserve stillness exclusively for "needs you." Motion is the healthy baseline.',
    dontExample: 'Animate for delight - if everything moves when something is wrong, the signal dies.',
    hermesMap:
      'A wall-display mode for Hermes Cloud instances, cron automations, and subagent fleets - complementing Telegram check-ins and the web dashboard. Ambient Supervision is what the idle dashboard wants to become.',
  },
  {
    id: 'show-the-work',
    name: 'Show the Work',
    tagline: 'Plain language by default; full technical truth one gesture away.',
    definition:
      'Show the Work is the pattern behind Rosetta, the plain-language console named for the stone that made one decree readable in every script. Every agent action is rendered in plain language first, with a reversible disclosure to a structured work panel (invocation, output, provenance, timing). Expertise becomes a rendering choice. Nothing is deleted for accessibility; altitude is adjustable. That is "intelligence for all" as an interface, not a slogan.',
    when:
      'Any product where technical and non-technical people supervise the same agents: households, teams, operators checking Hermes Cloud from a phone.',
    anatomy: [
      'Status sentence with state dot and plan meter',
      'Altitude control (Simple / Detailed / Technical)',
      'Pinned needs-you decision dock',
      'Translated moment cards with friendly time',
      'Per-card "How did it do this?" work panel',
      'Structured work panel: invocation / output / provenance',
    ],
    states: ['simple', 'detailed', 'technical', 'disclosed'],
    doExample:
      'Keep the technical layer one reversible gesture away. Never a separate product or a dumbed-down fork.',
    dontExample:
      'Hide invocations forever, or force everyone through a developer console to approve a purchase.',
    hermesMap:
      'Non-technical operators supervising Hermes Cloud agents from the dashboard or Telegram. Same learning-loop agent, readable by everyone in the household or team. The Tool Gateway and approval overlays stay; Rosetta is how they speak English.',
  },
]

export function getPattern(id: string): PatternDef | undefined {
  return patterns.find((p) => p.id === id)
}
