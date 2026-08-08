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
  // Prefer a short intent clause when it adds clarity
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
  // Light touch - keep numbers, soften jargon when obvious
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
  // Strip leading "You prefer" style if already present in note
  const cleaned = text.replace(/^noted:\s*/i, '').replace(/\s*\(corrected\)\s*$/i, '')
  return `${agentName} will remember: ${cleaned}`
}

export function skillSentence(agentName: string, skillName: string): string {
  return `${agentName} learned a new skill from this task ("${skillName}"). Save it for next time?`
}

export function planRevisionSentence(reason: string): string {
  return `The plan changed: ${reason}`
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
