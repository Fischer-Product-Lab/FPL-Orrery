import type {
  ApprovalRequest,
  Artifact,
  FeedItem,
  SessionState,
  ToolCall,
} from '../../engine/types'

/** Tool name → past-tense plain verb phrase */
const TOOL_VERBS: Record<string, string> = {
  'web.search': 'searched the web',
  'travel.search_flights': 'looked up flights',
  'travel.search_lodging': 'looked up lodging',
  'travel.purchase': 'made a purchase',
  'travel.book_transfer': 'booked a transfer',
  'ci.fetch_logs': 'read the build logs',
  'repo.search': 'searched the code',
  'shell.run': 'ran a command',
  'repo.push': 'published the code change',
  'train.estimate': 'estimated training cost',
  'train.launch': 'started the training run',
  'eval.run': 'ran an evaluation',
}

const ARTIFACT_KINDS: Record<string, string> = {
  document: 'document',
  spreadsheet: 'budget sheet',
  receipt: 'receipt',
  diff: 'code change',
  model: 'trained model',
}

const STEER_SUGGESTIONS: Record<string, string[]> = {
  offsite: [
    'Keep it under budget',
    'Prefer morning flights',
    'Give me a quick status update',
  ],
  'nightly-build': [
    'Fix the type errors carefully',
    'Do not push yet',
    'Give me a quick status update',
  ],
  finetune: [
    'Stay within budget',
    'Pause if loss looks wrong',
    'Give me a quick status update',
  ],
}

export function toolVerb(name: string): string {
  return TOOL_VERBS[name] ?? `used a tool called ${name}`
}

export function artifactKindLabel(kind: string): string {
  return ARTIFACT_KINDS[kind] ?? kind
}

export function statusSentence(session: SessionState): string {
  const name = session.meta.agentName
  const pending = Object.values(session.approvals).find((a) => a.status === 'pending')
  if (pending || session.meta.triage === 'needs_you') {
    if (pending?.risk === 'money' || pending?.costUsd != null) {
      return `${name} needs your OK before spending money.`
    }
    if (pending?.risk === 'destructive' || pending?.risk === 'high') {
      return `${name} needs your OK before making a lasting change.`
    }
    return `${name} is waiting on a decision from you.`
  }
  if (session.meta.triage === 'done') {
    const n = session.artifacts.length
    if (n === 0) return `All done. ${name} finished the task.`
    if (n === 1) return `All done. 1 thing is ready for you.`
    return `All done. ${n} things are ready for you.`
  }
  if (session.paused) {
    return `${name} is paused, waiting for you.`
  }
  return `Working steadily. Nothing needed from you right now.`
}

export function toolSentence(agentName: string, tool: ToolCall): string {
  const verb = toolVerb(tool.name)
  const intent = tool.intent.replace(/\.$/, '')
  let sentence = `${agentName} ${verb}`
  if (intent && !intent.toLowerCase().includes(tool.name.split('.')[0])) {
    sentence += `: ${intent.charAt(0).toLowerCase()}${intent.slice(1)}`
  }
  if (tool.resultChip) {
    sentence += ` (${friendlyResult(tool.resultChip)})`
  } else if (tool.status === 'running') {
    sentence += ', still working on it'
  } else if (tool.status === 'failed') {
    sentence += ', that did not work'
  }
  return sentence.endsWith('.') ? sentence : `${sentence}.`
}

function friendlyResult(chip: string): string {
  if (/^\d+\s*shortlisted$/i.test(chip)) return chip.replace(/shortlisted/i, 'good options')
  if (/^booked$/i.test(chip)) return 'booked'
  if (/passed/i.test(chip)) return chip
  return chip
}

export function approvalHeadline(agentName: string, approval: ApprovalRequest): string {
  if (approval.costUsd != null) {
    return `${agentName} wants to spend $${approval.costUsd.toLocaleString()} on ${approval.title.toLowerCase().replace(/^authorize\s+/i, '')}. OK to go ahead?`
  }
  return `${agentName} is asking: ${approval.title}. OK to go ahead?`
}

export function approvalSummary(approval: ApprovalRequest): string {
  return approval.summary
}

export function artifactSentence(agentName: string, artifact: Artifact): string {
  const kind = artifactKindLabel(artifact.kind)
  return `${agentName} made something for you: ${artifact.title} (${kind}).`
}

export function memorySentence(agentName: string, text: string): string {
  const cleaned = text.replace(/^noted:\s*/i, '').replace(/\s*\(corrected\)\s*$/i, '')
  return `${agentName} will remember: ${cleaned}`
}

export function skillSentence(agentName: string, skillName: string): string {
  return `${agentName} learned a new skill from this task ("${skillName}"). Save it for next time?`
}

export function planRevisionSentence(reason: string): string {
  return `The plan changed: ${reason}`
}

/** Friendly elapsed time for cards (virtual ms from session start). */
export function friendlyElapsed(ms: number): string {
  if (ms < 60_000) return 'just started'
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 60) {
    if (minutes === 1) return '1 minute in'
    return `${minutes} minutes in`
  }
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (hours === 1 && rem === 0) return '1 hour in'
  if (hours === 1) return `1 hour ${rem} minutes in`
  if (rem === 0) return `${hours} hours in`
  return `${hours} hours ${rem} minutes in`
}

/** Gap label between two moments when the gap is meaningful. */
export function friendlyGap(ms: number): string | null {
  if (ms < 30 * 60_000) return null
  if (ms < 60 * 60_000) return 'a little later'
  const hours = Math.round(ms / (60 * 60_000))
  if (hours === 1) return 'about an hour later'
  if (hours < 24) return `about ${hours} hours later`
  return 'much later'
}

/** Duration between tool start and end. */
export function friendlyDuration(startedAt?: number, completedAt?: number): string | null {
  if (startedAt == null || completedAt == null || completedAt < startedAt) return null
  const ms = completedAt - startedAt
  if (ms < 60_000) return 'took under a minute'
  const minutes = Math.round(ms / 60_000)
  if (minutes === 1) return 'took 1 minute'
  if (minutes < 60) return `took ${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (hours === 1 && rem === 0) return 'took 1 hour'
  if (hours === 1) return `took 1 hour ${rem} minutes`
  if (rem === 0) return `took ${hours} hours`
  return `took ${hours} hours ${rem} minutes`
}

export type MomentWeight = 'headline' | 'quiet'

export function momentWeight(moment: FriendlyMoment): MomentWeight {
  switch (moment.kind) {
    case 'approval':
    case 'artifact':
    case 'memory':
    case 'skill':
    case 'plan_revision':
    case 'steer':
      return 'headline'
    case 'tool':
      return moment.tool.status === 'failed' ? 'headline' : 'quiet'
    case 'thought':
    case 'notification':
    case 'system':
    default:
      return 'quiet'
  }
}

export type FeedDigest = {
  all: number
  madeForYou: number
  decisions: number
  learning: number
}

export function digest(moments: FriendlyMoment[]): FeedDigest {
  let madeForYou = 0
  let decisions = 0
  let learning = 0
  for (const m of moments) {
    if (m.kind === 'artifact') madeForYou += 1
    if (m.kind === 'approval') decisions += 1
    if (m.kind === 'memory' || m.kind === 'skill') learning += 1
  }
  return { all: moments.length, madeForYou, decisions, learning }
}

export type FeedFilter = 'all' | 'made_for_you' | 'decisions' | 'learning'

export function filterMoments(moments: FriendlyMoment[], filter: FeedFilter): FriendlyMoment[] {
  if (filter === 'all') return moments
  if (filter === 'made_for_you') return moments.filter((m) => m.kind === 'artifact')
  if (filter === 'decisions') return moments.filter((m) => m.kind === 'approval')
  return moments.filter((m) => m.kind === 'memory' || m.kind === 'skill')
}

export function steerSuggestions(sessionId: string): string[] {
  return STEER_SUGGESTIONS[sessionId] ?? [
    'Keep going carefully',
    'Pause if anything looks risky',
    'Give me a quick status update',
  ]
}

export function planProgress(session: SessionState): {
  done: number
  total: number
  activeIndex: number
  pct: number
} {
  const total = session.plan.length
  const done = session.plan.filter((s) => s.status === 'done').length
  const activeIndex = session.plan.findIndex((s) => s.status === 'active')
  const pct = total === 0 ? 0 : Math.round(((done + (activeIndex >= 0 ? 0.35 : 0)) / total) * 100)
  return { done, total, activeIndex, pct: Math.min(100, pct) }
}

export function digestLine(session: SessionState): string {
  const { done, total, activeIndex } = planProgress(session)
  const stepPart =
    total === 0
      ? 'Getting started'
      : activeIndex >= 0
        ? `Step ${activeIndex + 1} of ${total}`
        : done === total
          ? `All ${total} steps done`
          : `${done} of ${total} steps done`
  const timePart = friendlyElapsed(session.virtualTimeMs)
  const cost = session.meta.costUsd
  if (cost > 0) {
    return `${stepPart} · ${timePart} · About $${cost.toFixed(2)} so far`
  }
  return `${stepPart} · ${timePart}`
}

export function rightNowSentence(session: SessionState): string | null {
  const pending = Object.values(session.approvals).some((a) => a.status === 'pending')
  if (pending) return null
  const running = Object.values(session.tools).find((t) => t.status === 'running')
  if (running) return toolSentence(session.meta.agentName, running)
  if (session.currentThought) {
    return `${session.meta.agentName} is thinking: ${session.currentThought}`
  }
  return null
}

export type FriendlyMoment =
  | {
      kind: 'tool'
      id: string
      at: number
      sentence: string
      tool: ToolCall
    }
  | {
      kind: 'approval'
      id: string
      at: number
      headline: string
      summary: string
      approval: ApprovalRequest
    }
  | {
      kind: 'artifact'
      id: string
      at: number
      sentence: string
      artifact: Artifact
    }
  | {
      kind: 'memory'
      id: string
      at: number
      sentence: string
      memoryId: string
      corrected?: boolean
    }
  | {
      kind: 'skill'
      id: string
      at: number
      sentence: string
      skillId: string
      skillName: string
      accepted?: boolean | null
    }
  | {
      kind: 'plan_revision'
      id: string
      at: number
      sentence: string
    }
  | {
      kind: 'thought'
      id: string
      at: number
      sentence: string
    }
  | {
      kind: 'steer'
      id: string
      at: number
      sentence: string
    }
  | {
      kind: 'notification'
      id: string
      at: number
      sentence: string
    }
  | {
      kind: 'system'
      id: string
      at: number
      sentence: string
    }

export type FeedRow =
  | { type: 'moment'; moment: FriendlyMoment }
  | { type: 'gap'; id: string; label: string }
  | { type: 'quiet_group'; id: string; count: number; agentName: string; moments: FriendlyMoment[] }

/** Build feed rows with gap dividers; optionally collapse quiet work at Simple altitude. */
export function buildFeedRows(
  moments: FriendlyMoment[],
  agentName: string,
  opts: { collapseQuiet: boolean },
): FeedRow[] {
  const rows: FeedRow[] = []
  let i = 0
  while (i < moments.length) {
    if (i > 0) {
      const gap = friendlyGap(moments[i].at - moments[i - 1].at)
      if (gap) rows.push({ type: 'gap', id: `gap-${moments[i].id}`, label: gap })
    }

    if (opts.collapseQuiet && momentWeight(moments[i]) === 'quiet') {
      const group: FriendlyMoment[] = []
      while (i < moments.length && momentWeight(moments[i]) === 'quiet') {
        // Do not span a large gap inside a quiet group
        if (
          group.length > 0 &&
          friendlyGap(moments[i].at - group[group.length - 1].at) != null
        ) {
          break
        }
        group.push(moments[i])
        i += 1
      }
      if (group.length === 1) {
        rows.push({ type: 'moment', moment: group[0] })
      } else {
        rows.push({
          type: 'quiet_group',
          id: `quiet-${group[0].id}`,
          count: group.length,
          agentName,
          moments: group,
        })
      }
      continue
    }

    rows.push({ type: 'moment', moment: moments[i] })
    i += 1
  }
  return rows
}

export function translateFeed(session: SessionState): FriendlyMoment[] {
  const agent = session.meta.agentName
  const moments: FriendlyMoment[] = []

  for (const item of session.feed) {
    const m = translateFeedItem(agent, item)
    if (m) moments.push(m)
  }
  return moments
}

export function translateFeedItem(
  agentName: string,
  item: FeedItem,
): FriendlyMoment | null {
  switch (item.kind) {
    case 'tool':
      return {
        kind: 'tool',
        id: item.id,
        at: item.at,
        sentence: toolSentence(agentName, item.tool),
        tool: item.tool,
      }
    case 'approval':
      return {
        kind: 'approval',
        id: item.id,
        at: item.at,
        headline: approvalHeadline(agentName, item.approval),
        summary: approvalSummary(item.approval),
        approval: item.approval,
      }
    case 'artifact':
      return {
        kind: 'artifact',
        id: item.id,
        at: item.at,
        sentence: artifactSentence(agentName, item.artifact),
        artifact: item.artifact,
      }
    case 'memory':
      return {
        kind: 'memory',
        id: item.id,
        at: item.at,
        sentence: memorySentence(agentName, item.memory.text),
        memoryId: item.memory.id,
        corrected: item.memory.corrected,
      }
    case 'skill':
      return {
        kind: 'skill',
        id: item.id,
        at: item.at,
        sentence: skillSentence(agentName, item.skill.name),
        skillId: item.skill.id,
        skillName: item.skill.name,
        accepted: item.skill.accepted,
      }
    case 'plan_revision':
      return {
        kind: 'plan_revision',
        id: item.id,
        at: item.at,
        sentence: planRevisionSentence(item.reason),
      }
    case 'thought':
      return {
        kind: 'thought',
        id: item.id,
        at: item.at,
        sentence: `${agentName} is thinking: ${item.text}`,
      }
    case 'steer':
      return {
        kind: 'steer',
        id: item.id,
        at: item.at,
        sentence: item.message,
      }
    case 'notification':
      return {
        kind: 'notification',
        id: item.id,
        at: item.at,
        sentence: `${item.title}: ${item.body}`,
      }
    case 'system':
      return {
        kind: 'system',
        id: item.id,
        at: item.at,
        sentence: item.text,
      }
    default:
      return null
  }
}
