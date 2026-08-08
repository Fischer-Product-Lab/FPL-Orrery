import { useEffect, useRef } from 'react'
import { useThemeStore } from '../kit/theme'
import { getTheme } from '../kit/themes'

type Star = {
  x: number
  y: number
  r: number
  depth: number
  phase: number
  twinkle: number
}

type Meteor = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

type Palette = {
  accent: string
  text: string
  textTertiary: string
  bg: string
}

function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement)
  const get = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback
  return {
    accent: get('--color-accent', '#ffb000'),
    text: get('--color-text', '#ede6d8'),
    textTertiary: get('--color-text-tertiary', '#6e675c'),
    bg: get('--color-bg', '#0b0a08'),
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function seedStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    const depth = Math.random() < 0.45 ? 0.35 + Math.random() * 0.25 : 0.65 + Math.random() * 0.35
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: depth < 0.55 ? 0.4 + Math.random() * 0.6 : 0.7 + Math.random() * 1.2,
      depth,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.4 + Math.random() * 1.2,
    })
  }
  return stars
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
  }
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`)
  }
  return color
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeId = useThemeStore((s) => s.themeId)
  const isDark = getTheme(themeId).isDark

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars: Star[] = []
    let meteor: Meteor | null = null
    let nextMeteorAt = performance.now() + 8000 + Math.random() * 12000
    let palette = readPalette()
    let raf = 0
    let running = true
    let pointerX = 0.5
    let pointerY = 0.5
    let w = 0
    let h = 0
    const reduced = prefersReducedMotion()
    const baseAlpha = isDark ? 1 : 0.35

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = seedStars(w, h, 140)
    }

    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX / Math.max(1, w)
      pointerY = e.clientY / Math.max(1, h)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    const themeObserver = new MutationObserver(() => {
      palette = readPalette()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style'],
    })

    let last = performance.now()

    const spawnMeteor = () => {
      const fromLeft = Math.random() > 0.35
      meteor = {
        x: fromLeft ? -40 : w * (0.2 + Math.random() * 0.5),
        y: Math.random() * h * 0.45,
        vx: fromLeft ? 4.2 + Math.random() * 2.2 : 2.8 + Math.random() * 1.6,
        vy: 1.4 + Math.random() * 1.8,
        life: 0,
        maxLife: 45 + Math.random() * 35,
      }
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const a = (0.25 + s.depth * 0.45) * baseAlpha
        ctx.beginPath()
        ctx.fillStyle = withAlpha(s.depth > 0.6 ? palette.text : palette.textTertiary, a)
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(32, now - last)
      last = now
      ctx.clearRect(0, 0, w, h)

      const px = (pointerX - 0.5) * 18
      const py = (pointerY - 0.5) * 12

      for (const s of stars) {
        const parallax = (1.1 - s.depth) * 0.85
        const x = ((s.x + px * parallax + now * 0.004 * s.depth) % (w + 20) + w + 20) % (w + 20) - 10
        const y = ((s.y + py * parallax + now * 0.002 * s.depth) % (h + 20) + h + 20) % (h + 20) - 10
        const tw =
          0.55 + 0.45 * Math.sin(now * 0.001 * s.twinkle + s.phase)
        const a = (0.18 + s.depth * 0.55) * tw * baseAlpha
        ctx.beginPath()
        ctx.fillStyle = withAlpha(s.depth > 0.6 ? palette.accent : palette.text, a * 0.85)
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!meteor && now >= nextMeteorAt) {
        spawnMeteor()
        nextMeteorAt = now + 25000 + Math.random() * 25000
      }

      if (meteor) {
        meteor.life += dt / 16
        meteor.x += meteor.vx * (dt / 16)
        meteor.y += meteor.vy * (dt / 16)
        const t = meteor.life / meteor.maxLife
        if (t >= 1 || meteor.x > w + 80 || meteor.y > h + 80) {
          meteor = null
        } else {
          const fade = 1 - t
          const trail = 28
          const grad = ctx.createLinearGradient(
            meteor.x - meteor.vx * trail,
            meteor.y - meteor.vy * trail,
            meteor.x,
            meteor.y,
          )
          grad.addColorStop(0, withAlpha(palette.accent, 0))
          grad.addColorStop(0.55, withAlpha(palette.accent, 0.35 * fade * baseAlpha))
          grad.addColorStop(1, withAlpha(palette.text, 0.85 * fade * baseAlpha))
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.25
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(meteor.x - meteor.vx * trail, meteor.y - meteor.vy * trail)
          ctx.lineTo(meteor.x, meteor.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.fillStyle = withAlpha(palette.accent, 0.9 * fade * baseAlpha)
          ctx.arc(meteor.x, meteor.y, 1.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    if (reduced) {
      drawStatic()
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      themeObserver.disconnect()
    }
  }, [themeId, isDark])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  )
}
