export type PlanStepStatus = 'pending' | 'active' | 'done' | 'skipped' | 'blocked'

export type PlanStep = {
  id: string
  label: string
  status: PlanStepStatus
}

export type ToolRisk = 'low' | 'medium' | 'high' | 'destructive'

export type ApprovalRisk = 'low' | 'medium' | 'high' | 'money' | 'destructive'

export type TriageLevel = 'needs_you' | 'running' | 'done' | 'idle'

export type SessionMeta = {
  id: string
  agentName: string
  taskTitle: string
  backend: string
  triage: TriageLevel
  costUsd: number
}

export type Artifact = {
  id: string
  title: string
  kind: string
  stepId?: string
  toolCallId?: string
  preview?: string
  createdAt: number
}

export type MemoryNote = {
  id: string
  text: string
  createdAt: number
  corrected?: boolean
}

export type SkillProposal = {
  id: string
  name: string
  description: string
  createdAt: number
  accepted?: boolean | null
}

export type ApprovalRequest = {
  id: string
  title: string
  summary: string
  evidence: string[]
  costUsd?: number
  risk: ApprovalRisk
  stepId?: string
  expiresAt?: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
}

export type ToolCall = {
  id: string
  name: string
  intent: string
  invocation: string
  risk: ToolRisk
  status: 'running' | 'done' | 'failed'
  output: string
  resultChip?: string
  stepId?: string
}

export type ThoughtChunk = {
  id: string
  text: string
  at: number
}

export type RecapDigest = {
  decided: string[]
  produced: string[]
  waiting: string[]
  generatedAt: number
}

/* ── Event schema ─────────────────────────────────────────────── */

type BaseEvent = {
  id: string
  /** Virtual time offset in milliseconds from session start */
  t: number
  sessionId: string
}

export type PlanCreatedEvent = BaseEvent & {
  type: 'plan.created'
  steps: PlanStep[]
  rationale?: string
}

export type PlanRevisedEvent = BaseEvent & {
  type: 'plan.revised'
  steps: PlanStep[]
  reason: string
  diff: { added: string[]; removed: string[]; changed: string[] }
}

export type StepStartedEvent = BaseEvent & {
  type: 'step.started'
  stepId: string
}

export type StepCompletedEvent = BaseEvent & {
  type: 'step.completed'
  stepId: string
}

export type ThoughtEvent = BaseEvent & {
  type: 'thought'
  text: string
  streamId?: string
}

export type ToolCallStartedEvent = BaseEvent & {
  type: 'tool.call.started'
  toolCallId: string
  name: string
  intent: string
  invocation: string
  risk: ToolRisk
  stepId?: string
}

export type ToolOutputEvent = BaseEvent & {
  type: 'tool.output'
  toolCallId: string
  chunk: string
}

export type ToolCallCompletedEvent = BaseEvent & {
  type: 'tool.call.completed'
  toolCallId: string
  resultChip?: string
  failed?: boolean
}

export type ApprovalRequestedEvent = BaseEvent & {
  type: 'approval.requested'
  approval: Omit<ApprovalRequest, 'status'> & { status?: ApprovalRequest['status'] }
}

export type ApprovalResolvedEvent = BaseEvent & {
  type: 'approval.resolved'
  approvalId: string
  decision: 'approved' | 'rejected'
}

export type ArtifactCreatedEvent = BaseEvent & {
  type: 'artifact.created'
  artifact: Omit<Artifact, 'createdAt'> & { createdAt?: number }
}

export type MemoryNotedEvent = BaseEvent & {
  type: 'memory.noted'
  memory: Omit<MemoryNote, 'createdAt' | 'corrected'> & { createdAt?: number }
}

export type SkillProposedEvent = BaseEvent & {
  type: 'skill.proposed'
  skill: Omit<SkillProposal, 'createdAt' | 'accepted'> & { createdAt?: number }
}

export type RunPausedEvent = BaseEvent & {
  type: 'run.paused'
  reason?: string
}

export type RunResumedEvent = BaseEvent & {
  type: 'run.resumed'
}

export type NotificationEvent = BaseEvent & {
  type: 'notification'
  title: string
  body: string
  urgency?: 'normal' | 'high'
}

export type CostUpdatedEvent = BaseEvent & {
  type: 'cost.updated'
  costUsd: number
}

export type SteerAcknowledgedEvent = BaseEvent & {
  type: 'steer.acknowledged'
  message: string
  foldIntoStepId?: string
}

export type TriageUpdatedEvent = BaseEvent & {
  type: 'triage.updated'
  triage: TriageLevel
}

export type SessionEvent =
  | PlanCreatedEvent
  | PlanRevisedEvent
  | StepStartedEvent
  | StepCompletedEvent
  | ThoughtEvent
  | ToolCallStartedEvent
  | ToolOutputEvent
  | ToolCallCompletedEvent
  | ApprovalRequestedEvent
  | ApprovalResolvedEvent
  | ArtifactCreatedEvent
  | MemoryNotedEvent
  | SkillProposedEvent
  | RunPausedEvent
  | RunResumedEvent
  | NotificationEvent
  | CostUpdatedEvent
  | SteerAcknowledgedEvent
  | TriageUpdatedEvent

export type SessionScript = {
  meta: SessionMeta
  events: SessionEvent[]
}

export type FeedItem =
  | { kind: 'thought'; id: string; text: string; at: number }
  | { kind: 'tool'; id: string; tool: ToolCall; at: number }
  | { kind: 'approval'; id: string; approval: ApprovalRequest; at: number }
  | { kind: 'artifact'; id: string; artifact: Artifact; at: number }
  | { kind: 'memory'; id: string; memory: MemoryNote; at: number }
  | { kind: 'skill'; id: string; skill: SkillProposal; at: number }
  | { kind: 'plan_revision'; id: string; reason: string; diff: PlanRevisedEvent['diff']; at: number }
  | { kind: 'steer'; id: string; message: string; at: number }
  | { kind: 'notification'; id: string; title: string; body: string; at: number }
  | { kind: 'system'; id: string; text: string; at: number }

export type SessionState = {
  meta: SessionMeta
  plan: PlanStep[]
  planRevisionReason?: string
  planDiff?: PlanRevisedEvent['diff']
  feed: FeedItem[]
  thoughts: ThoughtChunk[]
  tools: Record<string, ToolCall>
  approvals: Record<string, ApprovalRequest>
  artifacts: Artifact[]
  memories: MemoryNote[]
  skills: SkillProposal[]
  paused: boolean
  currentThought: string
  recap: RecapDigest | null
  virtualTimeMs: number
  /** Index into script events that have been applied */
  eventCursor: number
}

export type Speed = 1 | 8 | 32
