import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '../../engine/store'
import { useThemeStore } from '../../kit/theme'
import {
  TAU,
  dist,
  polarToCart,
  sessionsToOrrery,
  springAngle,
  type OrbitModel,
} from './orreryMath'

export type OrreryVariant = 'hero' | 'full' | 'compact' | 'micro'

type Palette = {
  bg: string
  hairline: string
  hairlineStrong: string
  text: string
  textSecondary: string
  textTertiary: string
  accent: string
  success: string
  danger: string
  mono: string
}

type AnimOrbit = {
  id: string
  angle: number
  angleVel: number
  drift: number
  x: number
  y: number
  radius: number
}

type TooltipState = {
  id: string
  x: number
  y: number
  taskTitle: string
  agentName: string
  triage: string
  costUsd: number
  doneSteps: number
  totalSteps: number
}

function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement)
  const get = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback
  return {
    bg: get('--color-bg', '#0b0a08'),
    hairline: get('--color-hairline', 'rgba(255,244,224,0.12)'),
    hairlineStrong: get('--color-hairline-strong', 'rgba(255,244,224,0.22)'),
    text: get('--color-text', '#ede6d8'),
    textSecondary: get('--color-text-secondary', '#a39b8b'),
    textTertiary: get('--color-text-tertiary', '#6e675c'),
    accent: get('--color-accent', '#ffb000'),
    success: get('--color-success', '#56a662'),
    danger: get('--color-danger', '#e5484d'),
    mono: get('--font-mono', 'IBM Plex Mono, monospace'),
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function planetColor(orbit: OrbitModel, p: Palette): string {
  if (orbit.needsYou) return p.danger
  if (orbit.isDone) return p.success
  return p.accent
}

export function OrreryScene({
  variant = 'hero',
  className = '',
  showLegend = true,
  showLabels = true,
  interactive = true,
}: {
  variant?: OrreryVariant
  className?: string
  showLegend?: boolean
  showLabels?: boolean
  interactive?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const setActiveSession = useDemoStore((s) => s.setActiveSession)
  const themeId = useThemeStore((s) => s.themeId)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const animRef = useRef<Map<string, AnimOrbit>>(new Map())
  const hoverIdRef = useRef<string | null>(null)
  const reducedRef = useRef(false)
  const paletteRef = useRef<Palette | null>(null)
  const timeRef = useRef(0)
  const lastTsRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    paletteRef.current = readPalette()
    reducedRef.current = prefersReducedMotion()

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => {
      reducedRef.current = mq.matches
    }
    mq.addEventListener('change', onMq)

    let raf = 0
    let running = true
    let dpr = 1
    let w = 0
    let h = 0

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()

    const onVis = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else {
        running = true
        lastTsRef.current = 0
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    const hitTest = (mx: number, my: number): OrbitModel | null => {
      const { sessions } = useDemoStore.getState()
      const model = sessionsToOrrery(sessions)
      const cx = w / 2
      const cy = h / 2
      const sceneR = Math.min(w, h) * 0.42
      let best: OrbitModel | null = null
      let bestD = Infinity
      for (const orbit of model.orbits) {
        const anim = animRef.current.get(orbit.id)
        if (!anim) continue
        const hitR = variant === 'micro' ? 8 : variant === 'compact' ? 12 : 18
        const d = dist(mx, my, anim.x, anim.y)
        if (d < hitR && d < bestD) {
          bestD = d
          best = orbit
        }
        // also allow ring proximity for needs_you
        void sceneR
        void cx
        void cy
      }
      return best
    }

    const onMove = (e: PointerEvent) => {
      if (!interactive || variant === 'micro') return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const hit = hitTest(mx, my)
      hoverIdRef.current = hit?.id ?? null
      if (hit) {
        canvas.style.cursor = 'pointer'
        setTooltip({
          id: hit.id,
          x: mx,
          y: my,
          taskTitle: hit.taskTitle,
          agentName: hit.agentName,
          triage: hit.triage.replace('_', ' '),
          costUsd: hit.costUsd,
          doneSteps: hit.doneSteps,
          totalSteps: hit.totalSteps,
        })
      } else {
        canvas.style.cursor = 'default'
        setTooltip(null)
      }
    }

    const onLeave = () => {
      hoverIdRef.current = null
      setTooltip(null)
      canvas.style.cursor = 'default'
    }

    const onClick = (e: PointerEvent) => {
      if (!interactive || variant === 'micro') return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const hit = hitTest(mx, my)
      if (hit) {
        setActiveSession(hit.id)
        navigate('/console')
      }
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)

    const drawGraticule = (
      cx: number,
      cy: number,
      sceneR: number,
      p: Palette,
      simplified: boolean,
    ) => {
      ctx.strokeStyle = p.hairline
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, sceneR * 0.96, 0, TAU)
      ctx.stroke()

      const tickCount = simplified ? 12 : 36
      for (let i = 0; i < tickCount; i++) {
        const a = (i / tickCount) * TAU - Math.PI / 2
        const major = i % (tickCount / 4) === 0
        const inner = sceneR * (major ? 0.92 : 0.945)
        const outer = sceneR * 0.96
        const p0 = polarToCart(cx, cy, inner, a)
        const p1 = polarToCart(cx, cy, outer, a)
        ctx.strokeStyle = major ? p.hairlineStrong : p.hairline
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
      }

      // Operator core
      ctx.fillStyle = p.accent
      ctx.beginPath()
      ctx.arc(cx, cy, variant === 'micro' ? 2 : 4, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = p.accent
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.arc(cx, cy, variant === 'micro' ? 5 : 10, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1

      if (!simplified && variant !== 'micro') {
        ctx.fillStyle = p.textTertiary
        ctx.font = `9px ${p.mono}`
        ctx.textAlign = 'center'
        ctx.fillText('YOU', cx, cy + 22)
      }
    }

    const drawBrackets = (p: Palette) => {
      if (variant === 'micro' || variant === 'compact') return
      const m = 12
      const len = 22
      ctx.strokeStyle = p.hairlineStrong
      ctx.lineWidth = 1
      // TL
      ctx.beginPath()
      ctx.moveTo(m, m + len)
      ctx.lineTo(m, m)
      ctx.lineTo(m + len, m)
      ctx.stroke()
      // TR
      ctx.beginPath()
      ctx.moveTo(w - m - len, m)
      ctx.lineTo(w - m, m)
      ctx.lineTo(w - m, m + len)
      ctx.stroke()
      // BL
      ctx.beginPath()
      ctx.moveTo(m, h - m - len)
      ctx.lineTo(m, h - m)
      ctx.lineTo(m + len, h - m)
      ctx.stroke()
      // BR
      ctx.beginPath()
      ctx.moveTo(w - m - len, h - m)
      ctx.lineTo(w - m, h - m)
      ctx.lineTo(w - m, h - m - len)
      ctx.stroke()
    }

    const drawLegend = (p: Palette) => {
      if (!showLegend || variant === 'micro') return
      const x = 16
      const y = h - (variant === 'compact' ? 52 : 68)
      ctx.font = `9px ${p.mono}`
      ctx.textAlign = 'left'
      const items: [string, string][] = [
        [p.accent, 'running'],
        [p.danger, 'needs you'],
        [p.success, 'done'],
      ]
      items.forEach(([color, label], i) => {
        const iy = y + i * 14
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x + 4, iy, 3, 0, TAU)
        ctx.fill()
        ctx.fillStyle = p.textTertiary
        ctx.fillText(label, x + 12, iy + 3)
      })
    }

    const frame = (ts: number) => {
      if (!running) return
      const p = paletteRef.current ?? readPalette()
      const reduced = reducedRef.current
      const dt = lastTsRef.current ? Math.min(0.05, (ts - lastTsRef.current) / 1000) : 0.016
      lastTsRef.current = ts
      timeRef.current += dt

      const { sessions } = useDemoStore.getState()
      const model = sessionsToOrrery(sessions)
      const cx = w / 2
      const cy = h / 2
      const sceneR = Math.min(w, h) * (variant === 'micro' ? 0.46 : 0.42)
      const simplified = variant === 'compact' || variant === 'micro' || w < 480
      const labelsOn = showLabels && !simplified

      // Phosphor trail: composite previous frame at reduced alpha
      if (!reduced && variant !== 'micro') {
        ctx.fillStyle = p.bg
        ctx.globalAlpha = 0.22
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = p.bg
        ctx.fillRect(0, 0, w, h)
      }

      drawBrackets(p)
      drawGraticule(cx, cy, sceneR, p, simplified)

      for (const orbit of model.orbits) {
        const radius = orbit.radiusNorm * sceneR
        let anim = animRef.current.get(orbit.id)
        if (!anim) {
          anim = {
            id: orbit.id,
            angle: orbit.targetAngle,
            angleVel: 0,
            drift: orbit.basePhase,
            x: cx,
            y: cy,
            radius,
          }
          animRef.current.set(orbit.id, anim)
        }
        anim.radius = radius

        if (orbit.needsYou || reduced) {
          // Hard-stop: snap to target, zero velocity
          anim.angle = orbit.targetAngle
          anim.angleVel = 0
        } else if (orbit.isDone) {
          const sprung = springAngle(anim.angle, orbit.targetAngle, anim.angleVel, dt, 20, 10)
          anim.angle = sprung.value
          anim.angleVel = sprung.velocity
        } else {
          // Ambient drift so the scene breathes; progress still drives target
          const driftRate = 0.08 + hashDrift(orbit.id) * 0.04
          anim.drift += dt * driftRate
          const driftedTarget = orbit.targetAngle + Math.sin(anim.drift) * 0.12
          const sprung = springAngle(anim.angle, driftedTarget, anim.angleVel, dt)
          anim.angle = sprung.value
          anim.angleVel = sprung.velocity
        }

        const pos = polarToCart(cx, cy, radius, anim.angle)
        anim.x = pos.x
        anim.y = pos.y

        // Ring - solid for completed fraction, dashed remainder
        const progressAngle = orbit.progress * TAU
        const startA = -Math.PI / 2
        ctx.lineWidth = 1
        // dim full ring
        ctx.strokeStyle = p.hairline
        ctx.setLineDash([3, 4])
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, TAU)
        ctx.stroke()
        ctx.setLineDash([])
        // solid progress arc
        if (orbit.progress > 0.001) {
          ctx.strokeStyle = orbit.isDone
            ? p.success
            : orbit.needsYou
              ? p.danger
              : p.accent
          ctx.globalAlpha = 0.75
          ctx.beginPath()
          ctx.arc(cx, cy, radius, startA, startA + progressAngle)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Plan step ticks on ring
        if (!simplified) {
          for (const tick of orbit.ticks) {
            const tPos = polarToCart(cx, cy, radius, tick.angle)
            const bright =
              tick.status === 'done' || tick.status === 'skipped'
                ? p.textSecondary
                : tick.status === 'active'
                  ? p.accent
                  : p.textTertiary
            const pulse =
              !reduced && tick.status === 'active'
                ? 0.65 + 0.35 * Math.sin(timeRef.current * 5)
                : 1
            ctx.globalAlpha = pulse
            ctx.fillStyle = bright
            const tr =
              tick.status === 'active' ? 2.2 : tick.status === 'done' ? 1.6 : 1.1
            ctx.beginPath()
            ctx.arc(tPos.x, tPos.y, tr, 0, TAU)
            ctx.fill()
            ctx.globalAlpha = 1
          }
        }

        // Conjunction beam when needs you
        if (orbit.needsYou) {
          const pulse = reduced ? 1 : 0.45 + 0.55 * Math.sin(timeRef.current * 4)
          ctx.strokeStyle = p.danger
          ctx.globalAlpha = 0.25 + 0.35 * pulse
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
          ctx.globalAlpha = 1

          // Halo
          ctx.strokeStyle = p.danger
          ctx.globalAlpha = 0.4 + 0.3 * pulse
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, variant === 'micro' ? 6 : 14, 0, TAU)
          ctx.stroke()
          ctx.globalAlpha = 1

          if (variant !== 'micro' && variant !== 'compact') {
            ctx.fillStyle = p.danger
            ctx.font = `10px ${p.mono}`
            ctx.textAlign = 'center'
            ctx.fillText('NEEDS YOU', pos.x, pos.y - 22)
          }
        }

        // Planet
        const color = planetColor(orbit, p)
        const hovered = hoverIdRef.current === orbit.id
        const pr = variant === 'micro' ? 2.5 : variant === 'compact' ? 4 : hovered ? 6.5 : 5.5
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, pr, 0, TAU)
        ctx.fill()
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.35
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, pr + 3, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1

        // Tool satellite spark
        if (orbit.hasActiveTool && !reduced && !orbit.needsYou) {
          const sa = timeRef.current * 4.5 + orbit.basePhase
          const spark = polarToCart(pos.x, pos.y, pr + 9, sa)
          ctx.fillStyle = p.text
          ctx.beginPath()
          ctx.arc(spark.x, spark.y, 1.5, 0, TAU)
          ctx.fill()
        }

        // Labels
        if (labelsOn) {
          const labelAngle = anim.angle
          const lx = pos.x + Math.cos(labelAngle) * 18
          const ly = pos.y + Math.sin(labelAngle) * 18
          ctx.fillStyle = p.textSecondary
          ctx.font = `10px ${p.mono}`
          ctx.textAlign = lx >= cx ? 'left' : 'right'
          const short =
            orbit.taskTitle.length > 28
              ? `${orbit.taskTitle.slice(0, 26)}…`
              : orbit.taskTitle
          ctx.fillText(short, lx, ly)
          ctx.fillStyle = p.textTertiary
          ctx.font = `9px ${p.mono}`
          ctx.fillText(
            `${orbit.agentName}  $${orbit.costUsd.toFixed(2)}`,
            lx,
            ly + 12,
          )
        }
      }

      // Prune anim state for removed sessions
      for (const id of animRef.current.keys()) {
        if (!model.orbits.find((o) => o.id === id)) animRef.current.delete(id)
      }

      drawLegend(p)

      if (variant === 'full') {
        ctx.fillStyle = p.textTertiary
        ctx.font = `10px ${p.mono}`
        ctx.textAlign = 'right'
        ctx.fillText('stillness means you are needed', w - 16, 28)
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      mq.removeEventListener('change', onMq)
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [variant, showLegend, showLabels, interactive, navigate, setActiveSession, themeId])

  return (
    <div ref={wrapRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Live orrery of agent sessions" />
      {tooltip && interactive && variant !== 'micro' && (
        <div
          className="pointer-events-none absolute z-10 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-2 py-1.5 text-[10px] shadow-none"
          style={{
            left: Math.min(tooltip.x + 12, (wrapRef.current?.clientWidth ?? 300) - 180),
            top: Math.max(8, tooltip.y - 48),
          }}
        >
          <div className="text-[var(--color-text)]">{tooltip.taskTitle}</div>
          <div className="mt-0.5 text-[var(--color-text-tertiary)]">
            {tooltip.agentName} · {tooltip.triage} · ${tooltip.costUsd.toFixed(2)}
          </div>
          <div className="tabular text-[var(--color-text-tertiary)]">
            step {tooltip.doneSteps}/{tooltip.totalSteps}
          </div>
        </div>
      )}
    </div>
  )
}

function hashDrift(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return (h % 1000) / 1000
}
