import type {
  RecapDigest,
  SessionEvent,
  SessionState,
} from './types'

function emptySession(meta: SessionState['meta']): SessionState {
  return {
    meta: { ...meta, costUsd: meta.costUsd ?? 0 },
    plan: [],
    feed: [],
    thoughts: [],
    tools: {},
    approvals: {},
    artifacts: [],
    memories: [],
    skills: [],
    paused: false,
    currentThought: '',
    recap: null,
    virtualTimeMs: 0,
    eventCursor: 0,
  }
}

export { emptySession }

export function applyEvent(state: SessionState, event: SessionEvent): SessionState {
  const next: SessionState = {
    ...state,
    meta: { ...state.meta },
    plan: [...state.plan],
    feed: [...state.feed],
    thoughts: [...state.thoughts],
    tools: { ...state.tools },
    approvals: { ...state.approvals },
    artifacts: [...state.artifacts],
    memories: [...state.memories],
    skills: [...state.skills],
    virtualTimeMs: event.t,
  }

  switch (event.type) {
    case 'plan.created': {
      next.plan = event.steps.map((s) => ({ ...s }))
      next.feed.push({
        kind: 'system',
        id: event.id,
        text: event.rationale ?? 'Plan established.',
        at: event.t,
      })
      break
    }
    case 'plan.revised': {
      next.plan = event.steps.map((s) => ({ ...s }))
      next.planRevisionReason = event.reason
      next.planDiff = event.diff
      next.feed.push({
        kind: 'plan_revision',
        id: event.id,
        reason: event.reason,
        diff: event.diff,
        at: event.t,
      })
      break
    }
    case 'step.started': {
      next.plan = next.plan.map((s) =>
        s.id === event.stepId
          ? { ...s, status: 'active' }
          : s.status === 'active'
            ? { ...s, status: 'done' }
            : s,
      )
      break
    }
    case 'step.completed': {
      next.plan = next.plan.map((s) =>
        s.id === event.stepId ? { ...s, status: 'done' } : s,
      )
      break
    }
    case 'thought': {
      const chunk = { id: event.id, text: event.text, at: event.t }
      next.thoughts.push(chunk)
      next.currentThought = event.text
      const last = next.feed[next.feed.length - 1]
      if (last?.kind === 'thought' && event.streamId) {
        next.feed[next.feed.length - 1] = {
          ...last,
          text: `${last.text} ${event.text}`.trim(),
          at: event.t,
        }
      } else {
        next.feed.push({ kind: 'thought', id: event.id, text: event.text, at: event.t })
      }
      break
    }
    case 'tool.call.started': {
      const tool = {
        id: event.toolCallId,
        name: event.name,
        intent: event.intent,
        invocation: event.invocation,
        risk: event.risk,
        status: 'running' as const,
        output: '',
        stepId: event.stepId,
      }
      next.tools[event.toolCallId] = tool
      next.feed.push({ kind: 'tool', id: event.id, tool, at: event.t })
      break
    }
    case 'tool.output': {
      const existing = next.tools[event.toolCallId]
      if (existing) {
        const updated = {
          ...existing,
          output: existing.output + event.chunk,
        }
        next.tools[event.toolCallId] = updated
        next.feed = next.feed.map((item) =>
          item.kind === 'tool' && item.tool.id === event.toolCallId
            ? { ...item, tool: updated }
            : item,
        )
      }
      break
    }
    case 'tool.call.completed': {
      const existing = next.tools[event.toolCallId]
      if (existing) {
        const updated = {
          ...existing,
          status: event.failed ? ('failed' as const) : ('done' as const),
          resultChip: event.resultChip,
        }
        next.tools[event.toolCallId] = updated
        next.feed = next.feed.map((item) =>
          item.kind === 'tool' && item.tool.id === event.toolCallId
            ? { ...item, tool: updated }
            : item,
        )
      }
      break
    }
    case 'approval.requested': {
      const approval = {
        ...event.approval,
        status: 'pending' as const,
      }
      next.approvals[approval.id] = approval
      next.meta.triage = 'needs_you'
      next.paused = true
      next.feed.push({ kind: 'approval', id: event.id, approval, at: event.t })
      break
    }
    case 'approval.resolved': {
      const existing = next.approvals[event.approvalId]
      if (existing) {
        const updated = {
          ...existing,
          status: event.decision === 'approved' ? ('approved' as const) : ('rejected' as const),
        }
        next.approvals[event.approvalId] = updated
        next.feed = next.feed.map((item) =>
          item.kind === 'approval' && item.approval.id === event.approvalId
            ? { ...item, approval: updated }
            : item,
        )
      }
      next.paused = false
      if (next.meta.triage === 'needs_you') {
        next.meta.triage = 'running'
      }
      break
    }
    case 'artifact.created': {
      const artifact = {
        ...event.artifact,
        createdAt: event.artifact.createdAt ?? event.t,
      }
      next.artifacts.push(artifact)
      next.feed.push({ kind: 'artifact', id: event.id, artifact, at: event.t })
      break
    }
    case 'memory.noted': {
      const memory = {
        ...event.memory,
        createdAt: event.memory.createdAt ?? event.t,
      }
      next.memories.push(memory)
      next.feed.push({ kind: 'memory', id: event.id, memory, at: event.t })
      break
    }
    case 'skill.proposed': {
      const skill = {
        ...event.skill,
        createdAt: event.skill.createdAt ?? event.t,
        accepted: null,
      }
      next.skills.push(skill)
      next.feed.push({ kind: 'skill', id: event.id, skill, at: event.t })
      break
    }
    case 'run.paused': {
      next.paused = true
      next.feed.push({
        kind: 'system',
        id: event.id,
        text: event.reason ?? 'Run paused.',
        at: event.t,
      })
      break
    }
    case 'run.resumed': {
      next.paused = false
      next.feed.push({
        kind: 'system',
        id: event.id,
        text: 'Run resumed.',
        at: event.t,
      })
      break
    }
    case 'notification': {
      next.feed.push({
        kind: 'notification',
        id: event.id,
        title: event.title,
        body: event.body,
        at: event.t,
      })
      break
    }
    case 'cost.updated': {
      next.meta.costUsd = event.costUsd
      break
    }
    case 'steer.acknowledged': {
      next.feed.push({
        kind: 'steer',
        id: event.id,
        message: event.message,
        at: event.t,
      })
      break
    }
    case 'triage.updated': {
      next.meta.triage = event.triage
      break
    }
  }

  return next
}

export function buildRecap(state: SessionState): RecapDigest {
  const decided: string[] = []
  const produced: string[] = []
  const waiting: string[] = []

  for (const a of Object.values(state.approvals)) {
    if (a.status === 'approved') decided.push(`Approved: ${a.title}`)
    else if (a.status === 'rejected') decided.push(`Rejected: ${a.title}`)
    else if (a.status === 'pending') waiting.push(`Approval pending: ${a.title}`)
  }

  for (const art of state.artifacts) {
    produced.push(`${art.kind}: ${art.title}`)
  }

  for (const m of state.memories) {
    decided.push(`Noted: ${m.text}`)
  }

  for (const s of state.skills) {
    if (s.accepted === null || s.accepted === undefined) {
      waiting.push(`Skill proposal: ${s.name}`)
    } else if (s.accepted) {
      decided.push(`Saved skill: ${s.name}`)
    }
  }

  const active = state.plan.find((p) => p.status === 'active')
  if (active) waiting.push(`In progress: ${active.label}`)

  if (decided.length === 0 && produced.length === 0 && waiting.length === 0) {
    decided.push('Session still settling - no material outcomes yet.')
  }

  return {
    decided,
    produced,
    waiting,
    generatedAt: state.virtualTimeMs,
  }
}
