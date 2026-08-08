import type { PlanStep, SessionState, TriageLevel } from '../../engine/types'

export type OrbitTick = {
  index: number
  angle: number
  status: PlanStep['status']
}

export type OrbitModel = {
  id: string
  agentName: string
  taskTitle: string
  triage: TriageLevel
  costUsd: number
  /** 0..1 plan completion */
  progress: number
  /** Target angle in radians (progress * TAU + baseOffset), frozen when needs_you */
  targetAngle: number
  /** Ring radius in normalized units (0..1 of scene radius) */
  radiusNorm: number
  ticks: OrbitTick[]
  doneSteps: number
  totalSteps: number
  hasActiveTool: boolean
  needsYou: boolean
  isDone: boolean
  isRunning: boolean
  /** Stable base phase so sessions don't stack */
  basePhase: number
}

export type OrreryModel = {
  orbits: OrbitModel[]
}

const TAU = Math.PI * 2

/** Stable hash → 0..1 for deterministic phase offsets */
export function hash01(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

export function planProgress(plan: PlanStep[]): {
  progress: number
  doneSteps: number
  totalSteps: number
  ticks: OrbitTick[]
} {
  const totalSteps = plan.length
  if (totalSteps === 0) {
    return { progress: 0, doneSteps: 0, totalSteps: 0, ticks: [] }
  }
  const doneSteps = plan.filter((s) => s.status === 'done' || s.status === 'skipped').length
  const activeIndex = plan.findIndex((s) => s.status === 'active')
  // Partial credit for active step
  let progress = doneSteps / totalSteps
  if (activeIndex >= 0) {
    progress = (doneSteps + 0.45) / totalSteps
  }
  progress = Math.max(0, Math.min(1, progress))

  const ticks: OrbitTick[] = plan.map((step, index) => ({
    index,
    angle: ((index + 0.5) / totalSteps) * TAU - Math.PI / 2,
    status: step.status,
  }))

  return { progress, doneSteps, totalSteps, ticks }
}

/** Preferred session order for rings (inner → outer) */
const RING_ORDER = ['nightly-build', 'offsite', 'finetune']

export function sessionsToOrrery(
  sessions: Record<string, SessionState>,
): OrreryModel {
  const ids = Object.keys(sessions)
  ids.sort((a, b) => {
    const ai = RING_ORDER.indexOf(a)
    const bi = RING_ORDER.indexOf(b)
    const ao = ai === -1 ? 99 : ai
    const bo = bi === -1 ? 99 : bi
    return ao - bo || a.localeCompare(b)
  })

  const n = Math.max(ids.length, 1)
  const orbits: OrbitModel[] = ids.map((id, i) => {
    const session = sessions[id]
    const { progress, doneSteps, totalSteps, ticks } = planProgress(session.plan)
    const basePhase = hash01(id) * TAU
    const needsYou =
      session.meta.triage === 'needs_you' ||
      Object.values(session.approvals).some((a) => a.status === 'pending')
    const isDone = session.meta.triage === 'done'
    const isRunning = session.meta.triage === 'running' || (!needsYou && !isDone)
    const hasActiveTool = Object.values(session.tools).some((t) => t.status === 'running')

    // Inner rings slightly denser; leave room for labels
    const radiusNorm = 0.28 + ((i + 0.5) / n) * 0.52

    // Angle: progress sweeps from -π/2 (top) clockwise-ish via progress * TAU
    // Freeze angle advancement conceptually when needsYou - renderer also hard-stops
    const targetAngle = -Math.PI / 2 + progress * TAU + basePhase * 0.08

    return {
      id,
      agentName: session.meta.agentName,
      taskTitle: session.meta.taskTitle,
      triage: needsYou ? 'needs_you' : session.meta.triage,
      costUsd: session.meta.costUsd,
      progress,
      targetAngle,
      radiusNorm,
      ticks,
      doneSteps,
      totalSteps,
      hasActiveTool,
      needsYou,
      isDone,
      isRunning: isRunning && !needsYou,
      basePhase,
    }
  })

  return { orbits }
}

/** Critical-damped spring toward target */
export function springStep(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  stiffness = 18,
  damping = 8,
): { value: number; velocity: number } {
  const force = (target - current) * stiffness
  const newVel = (velocity + force * dt) * Math.exp(-damping * dt)
  const value = current + newVel * dt
  return { value, velocity: newVel }
}

/** Shortest-path angular spring (handles wrap) */
export function springAngle(
  current: number,
  target: number,
  velocity: number,
  dt: number,
  stiffness = 14,
  damping = 7,
): { value: number; velocity: number } {
  let delta = target - current
  while (delta > Math.PI) delta -= TAU
  while (delta < -Math.PI) delta += TAU
  const force = delta * stiffness
  const newVel = (velocity + force * dt) * Math.exp(-damping * dt)
  let value = current + newVel * dt
  // Normalize
  while (value > Math.PI) value -= TAU
  while (value < -Math.PI) value += TAU
  return { value, velocity: newVel }
}

export function polarToCart(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  }
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return Math.sqrt(dx * dx + dy * dy)
}

export { TAU }
