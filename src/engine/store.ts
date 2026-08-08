import { create } from 'zustand'
import { applyEvent, buildRecap, emptySession } from './applyEvent'
import type {
  SessionEvent,
  SessionMeta,
  SessionScript,
  SessionState,
  Speed,
} from './types'

export type DemoStore = {
  scripts: Record<string, SessionScript>
  sessions: Record<string, SessionState>
  activeSessionId: string | null
  playing: boolean
  speed: Speed
  /** Wall-clock ms of last tick */
  lastTickAt: number | null
  awayRecapVisible: boolean
  steerDraft: string
  selectedFeedIndex: number

  initScripts: (scripts: SessionScript[]) => void
  setActiveSession: (id: string) => void
  play: () => void
  pause: () => void
  setSpeed: (speed: Speed) => void
  tick: (now: number) => void
  jumpToNextEvent: () => void
  skipAhead: (ms: number) => void
  resetSession: (id?: string) => void
  resetAll: () => void
  resolveApproval: (sessionId: string, approvalId: string, decision: 'approved' | 'rejected') => void
  correctMemory: (sessionId: string, memoryId: string) => void
  resolveSkill: (sessionId: string, skillId: string, accepted: boolean) => void
  dismissRecap: () => void
  setSteerDraft: (text: string) => void
  submitSteer: (sessionId: string) => void
  setSelectedFeedIndex: (index: number) => void
}

function applyUntil(
  state: SessionState,
  events: SessionEvent[],
  targetTime: number,
  stopOnPendingApproval = true,
): SessionState {
  let cursor = state.eventCursor
  let current = { ...state, virtualTimeMs: Math.max(state.virtualTimeMs, targetTime) }

  while (cursor < events.length) {
    const event = events[cursor]
    if (event.t > targetTime) break

    // Don't auto-apply scripted approval.resolved - user must act
    if (event.type === 'approval.resolved') {
      // Skip scripted resolutions; wait for user
      cursor += 1
      continue
    }

    current = applyEvent(current, event)
    current.eventCursor = cursor + 1
    cursor = current.eventCursor

    if (
      stopOnPendingApproval &&
      event.type === 'approval.requested' &&
      current.approvals[event.approval.id]?.status === 'pending'
    ) {
      // Freeze at this approval - don't advance past it until resolved
      current.virtualTimeMs = event.t
      break
    }
  }

  current.eventCursor = cursor
  return current
}

function pendingApprovalBlocks(session: SessionState): boolean {
  return Object.values(session.approvals).some((a) => a.status === 'pending')
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  scripts: {},
  sessions: {},
  activeSessionId: null,
  playing: true,
  speed: 8,
  lastTickAt: null,
  awayRecapVisible: false,
  steerDraft: '',
  selectedFeedIndex: -1,

  initScripts: (scripts) => {
    const scriptMap: Record<string, SessionScript> = {}
    const sessions: Record<string, SessionState> = {}
    for (const s of scripts) {
      scriptMap[s.meta.id] = s
      sessions[s.meta.id] = emptySession(s.meta)
    }
    set({
      scripts: scriptMap,
      sessions,
      activeSessionId: scripts[0]?.meta.id ?? null,
      playing: true,
      lastTickAt: null,
      awayRecapVisible: false,
      selectedFeedIndex: -1,
    })
  },

  setActiveSession: (id) => set({ activeSessionId: id, selectedFeedIndex: -1 }),

  play: () => set({ playing: true, lastTickAt: performance.now() }),
  pause: () => set({ playing: false, lastTickAt: null }),
  setSpeed: (speed) => set({ speed }),

  tick: (now) => {
    const { playing, lastTickAt, speed, sessions, scripts, activeSessionId } = get()
    if (!playing) return

    const prev = lastTickAt ?? now
    const dt = (now - prev) * speed
    const nextSessions: Record<string, SessionState> = { ...sessions }
    let activeBlocked = false

    for (const id of Object.keys(scripts)) {
      const script = scripts[id]
      const session = nextSessions[id]
      if (!script || !session) continue
      if (pendingApprovalBlocks(session)) {
        if (id === activeSessionId) activeBlocked = true
        continue
      }

      const target = session.virtualTimeMs + dt
      const next = applyUntil(session, script.events, target)
      const lastT = script.events[script.events.length - 1]?.t ?? 0
      let triage = next.meta.triage
      if (next.eventCursor >= script.events.length && next.virtualTimeMs >= lastT) {
        if (!pendingApprovalBlocks(next) && triage !== 'needs_you') {
          triage = 'done'
        }
      }
      nextSessions[id] = {
        ...next,
        meta: { ...next.meta, triage },
      }
      if (id === activeSessionId && pendingApprovalBlocks(nextSessions[id])) {
        activeBlocked = true
      }
    }

    set({
      sessions: nextSessions,
      lastTickAt: activeBlocked ? null : now,
      ...(activeBlocked ? { playing: false } : {}),
    })
  },

  jumpToNextEvent: () => {
    const { activeSessionId, sessions, scripts } = get()
    if (!activeSessionId) return
    const script = scripts[activeSessionId]
    const session = sessions[activeSessionId]
    if (!script || !session) return
    if (pendingApprovalBlocks(session)) return

    // Find next non-approval-resolved event after cursor
    let i = session.eventCursor
    while (i < script.events.length && script.events[i].type === 'approval.resolved') i++
    const nextEvent = script.events[i]
    if (!nextEvent) return
    const updated = applyUntil(session, script.events, nextEvent.t)
    set({
      sessions: { ...sessions, [activeSessionId]: updated },
    })
  },

  skipAhead: (ms) => {
    const { activeSessionId, sessions, scripts } = get()
    if (!activeSessionId) return
    const script = scripts[activeSessionId]
    const session = sessions[activeSessionId]
    if (!script || !session) return

    // Skip can jump past pending approvals for demo purposes - resolve them as approved
    let current = { ...session }
    if (pendingApprovalBlocks(current)) {
      for (const a of Object.values(current.approvals)) {
        if (a.status === 'pending') {
          current = applyEvent(current, {
            id: `auto-${a.id}`,
            type: 'approval.resolved',
            t: current.virtualTimeMs,
            sessionId: activeSessionId,
            approvalId: a.id,
            decision: 'approved',
          })
        }
      }
    }

    const target = current.virtualTimeMs + ms
    const updated = applyUntil(current, script.events, target, false)

    // Auto-approve any approvals landed during the skip
    let final = updated
    for (const a of Object.values(updated.approvals)) {
      if (a.status === 'pending') {
        final = applyEvent(final, {
          id: `auto-${a.id}`,
          type: 'approval.resolved',
          t: final.virtualTimeMs,
          sessionId: activeSessionId,
          approvalId: a.id,
          decision: 'approved',
        })
      }
    }

    const withRecap = {
      ...final,
      recap: buildRecap(final),
      meta: {
        ...final.meta,
        triage: Object.values(final.approvals).some((a) => a.status === 'pending')
          ? ('needs_you' as const)
          : final.meta.triage === 'done'
            ? ('done' as const)
            : ('running' as const),
      },
    }

    set({
      sessions: { ...sessions, [activeSessionId]: withRecap },
      awayRecapVisible: true,
      playing: false,
      lastTickAt: null,
    })
  },

  resetSession: (id) => {
    const { activeSessionId, sessions, scripts } = get()
    const sid = id ?? activeSessionId
    if (!sid || !scripts[sid]) return
    set({
      sessions: { ...sessions, [sid]: emptySession(scripts[sid].meta) },
      awayRecapVisible: false,
      selectedFeedIndex: -1,
      lastTickAt: null,
    })
  },

  resetAll: () => {
    const { scripts } = get()
    const sessions: Record<string, SessionState> = {}
    for (const s of Object.values(scripts)) {
      sessions[s.meta.id] = emptySession(s.meta)
    }
    set({
      sessions,
      awayRecapVisible: false,
      selectedFeedIndex: -1,
      playing: true,
      lastTickAt: null,
    })
  },

  resolveApproval: (sessionId, approvalId, decision) => {
    const { sessions, scripts } = get()
    const session = sessions[sessionId]
    if (!session) return
    const updated = applyEvent(session, {
      id: `user-approval-${approvalId}`,
      type: 'approval.resolved',
      t: session.virtualTimeMs,
      sessionId,
      approvalId,
      decision,
    })
    // Advance past any skipped scripted approval.resolved events
    const script = scripts[sessionId]
    if (script) {
      let cursor = updated.eventCursor
      while (
        cursor < script.events.length &&
        script.events[cursor].type === 'approval.resolved'
      ) {
        cursor += 1
      }
      updated.eventCursor = cursor
    }
    set({
      sessions: { ...sessions, [sessionId]: updated },
      playing: decision === 'approved',
      lastTickAt: decision === 'approved' ? performance.now() : null,
    })
  },

  correctMemory: (sessionId, memoryId) => {
    const { sessions } = get()
    const session = sessions[sessionId]
    if (!session) return
    set({
      sessions: {
        ...sessions,
        [sessionId]: {
          ...session,
          memories: session.memories.map((m) =>
            m.id === memoryId ? { ...m, corrected: true, text: `${m.text} (corrected)` } : m,
          ),
          feed: session.feed.map((item) =>
            item.kind === 'memory' && item.memory.id === memoryId
              ? {
                  ...item,
                  memory: {
                    ...item.memory,
                    corrected: true,
                    text: `${item.memory.text} (corrected)`,
                  },
                }
              : item,
          ),
        },
      },
    })
  },

  resolveSkill: (sessionId, skillId, accepted) => {
    const { sessions } = get()
    const session = sessions[sessionId]
    if (!session) return
    set({
      sessions: {
        ...sessions,
        [sessionId]: {
          ...session,
          skills: session.skills.map((s) =>
            s.id === skillId ? { ...s, accepted } : s,
          ),
          feed: session.feed.map((item) =>
            item.kind === 'skill' && item.skill.id === skillId
              ? { ...item, skill: { ...item.skill, accepted } }
              : item,
          ),
        },
      },
    })
  },

  dismissRecap: () => set({ awayRecapVisible: false }),

  setSteerDraft: (text) => set({ steerDraft: text }),

  submitSteer: (sessionId) => {
    const { sessions, steerDraft } = get()
    const session = sessions[sessionId]
    if (!session || !steerDraft.trim()) return
    const updated = applyEvent(session, {
      id: `steer-${Date.now()}`,
      type: 'steer.acknowledged',
      t: session.virtualTimeMs,
      sessionId,
      message: `Steering received: "${steerDraft.trim()}". Folding into the active plan.`,
    })
    set({
      sessions: { ...sessions, [sessionId]: updated },
      steerDraft: '',
    })
  },

  setSelectedFeedIndex: (index) => set({ selectedFeedIndex: index }),
}))

export function getSessionList(sessions: Record<string, SessionState>): SessionMeta[] {
  const order: Record<SessionMeta['triage'], number> = {
    needs_you: 0,
    running: 1,
    idle: 2,
    done: 3,
  }
  return Object.values(sessions)
    .map((s) => s.meta)
    .sort((a, b) => order[a.triage] - order[b.triage] || a.taskTitle.localeCompare(b.taskTitle))
}

export function formatVirtualTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
