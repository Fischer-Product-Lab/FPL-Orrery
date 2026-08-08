import { useEffect, useRef } from 'react'
import { useThemeStore } from '../kit/theme'
import { getTheme } from '../kit/themes'

type LiveStar = {
  x: number
  y: number
  r: number
  depth: number
  phase: number
  twinkle: number
  /** 1 = field, 2 = luminary */
  tier: 1 | 2
  accentMix: number
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

type Rgb = { r: number; g: number; b: number }

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

function parseRgb(color: string): Rgb | null {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    if (full.length < 6) return null
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    }
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
  return null
}

function withAlpha(color: string, alpha: number): string {
  const rgb = parseRgb(color)
  if (!rgb) return color
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function mixColor(a: string, b: string, t: number): string {
  const pa = parseRgb(a)
  const pb = parseRgb(b)
  if (!pa || !pb) return a
  const r = Math.round(pa.r + (pb.r - pa.r) * t)
  const g = Math.round(pa.g + (pb.g - pa.g) * t)
  const bch = Math.round(pa.b + (pb.b - pa.b) * t)
  return `rgb(${r}, ${g}, ${bch})`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) {
    rp = c
    gp = x
  } else if (h < 120) {
    rp = x
    gp = c
  } else if (h < 180) {
    gp = c
    bp = x
  } else if (h < 240) {
    gp = x
    bp = c
  } else if (h < 300) {
    rp = x
    bp = c
  } else {
    rp = c
    bp = x
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

function rotateHue(color: string, degrees: number, satBoost = 0, lightBoost = 0): string {
  const rgb = parseRgb(color)
  if (!rgb) return color
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const next = hslToRgb(
    (h + degrees + 360) % 360,
    Math.min(1, Math.max(0, s + satBoost)),
    Math.min(1, Math.max(0, l + lightBoost)),
  )
  return `rgb(${next.r}, ${next.g}, ${next.b})`
}

/** Deterministic hash noise in [0, 1] */
function hash2(x: number, y: number, seed: number): number {
  let n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  const a = hash2(x0, y0, seed)
  const b = hash2(x0 + 1, y0, seed)
  const c = hash2(x0, y0 + 1, seed)
  const d = hash2(x0 + 1, y0 + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number, seed: number, octaves = 5): number {
  let amp = 0.5
  let freq = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * smoothNoise(x * freq, y * freq, seed + i * 19)
    norm += amp
    amp *= 0.5
    freq *= 2.05
  }
  return sum / norm
}

/** Signed distance from point to a diagonal galactic band through the viewport */
function bandMask(nx: number, ny: number, _w?: number, _h?: number): number {
  void _w
  void _h
  // Diagonal line: y = mx + b through center with slight tilt
  const cx = 0.42
  const cy = 0.48
  const angle = -0.55
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = nx - cx
  const dy = ny - cy
  const along = dx * cos + dy * sin
  const across = -dx * sin + dy * cos
  // Width of band in normalized coords
  const halfW = 0.12 + 0.04 * Math.sin(along * 6)
  const dist = Math.abs(across) / halfW
  const band = Math.exp(-dist * dist * 1.8)

  // Soft pockets / clouds off the main ridge
  const p1 = Math.exp(-((nx - 0.22) ** 2 * 18 + (ny - 0.35) ** 2 * 22))
  const p2 = Math.exp(-((nx - 0.72) ** 2 * 14 + (ny - 0.62) ** 2 * 16))
  const p3 = Math.exp(-((nx - 0.55) ** 2 * 28 + (ny - 0.28) ** 2 * 20))
  return Math.min(1, band * 0.95 + p1 * 0.55 + p2 * 0.45 + p3 * 0.35)
}

function createOffscreen(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.floor(w))
  c.height = Math.max(1, Math.floor(h))
  return c
}

function buildNebulaLayer(w: number, h: number, palette: Palette, isDark: boolean): HTMLCanvasElement {
  const scale = 6
  const lw = Math.max(48, Math.floor(w / scale))
  const lh = Math.max(32, Math.floor(h / scale))
  const low = createOffscreen(lw, lh)
  const lctx = low.getContext('2d')!
  const img = lctx.createImageData(lw, lh)
  const data = img.data

  const accent = parseRgb(palette.accent) ?? { r: 255, g: 176, b: 0 }
  const secondary = parseRgb(rotateHue(palette.accent, 52, 0.08, -0.05)) ?? {
    r: 120,
    g: 90,
    b: 200,
  }
  const cool = parseRgb(rotateHue(palette.accent, -40, -0.05, -0.08)) ?? {
    r: 60,
    g: 80,
    b: 140,
  }

  const strength = isDark ? 1 : 0.35

  for (let y = 0; y < lh; y++) {
    for (let x = 0; x < lw; x++) {
      const nx = x / lw
      const ny = y / lh
      const n1 = fbm(nx * 3.2, ny * 3.2, 11, 5)
      const n2 = fbm(nx * 6.5 + 20, ny * 6.5, 37, 4)
      const dust = fbm(nx * 10, ny * 10, 91, 3)
      const mask = bandMask(nx, ny, w, h)

      // Cloud density with dust lanes carved out
      let dens = n1 * 0.7 + n2 * 0.3
      dens = dens * dens
      dens *= mask
      dens *= 1 - dust * 0.55 * mask

      const mixT = n2
      const r = Math.round(accent.r * (1 - mixT) + secondary.r * mixT * 0.7 + cool.r * mixT * 0.3)
      const g = Math.round(accent.g * (1 - mixT) + secondary.g * mixT * 0.7 + cool.g * mixT * 0.3)
      const b = Math.round(accent.b * (1 - mixT) + secondary.b * mixT * 0.7 + cool.b * mixT * 0.3)
      const a = Math.min(255, Math.floor(dens * 210 * strength))

      const i = (y * lw + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = a
    }
  }
  lctx.putImageData(img, 0, 0)

  // Upscale soft to full resolution
  const full = createOffscreen(w, h)
  const fctx = full.getContext('2d')!
  fctx.imageSmoothingEnabled = true
  fctx.imageSmoothingQuality = 'high'
  fctx.drawImage(low, 0, 0, w, h)

  // Soft glow wash along the band ridge
  fctx.globalCompositeOperation = 'screen'
  const ridge = fctx.createLinearGradient(0, h * 0.15, w, h * 0.85)
  ridge.addColorStop(0, withAlpha(palette.accent, 0))
  ridge.addColorStop(0.35, withAlpha(palette.accent, isDark ? 0.08 : 0.03))
  ridge.addColorStop(0.55, withAlpha(rotateHue(palette.accent, 40), isDark ? 0.1 : 0.035))
  ridge.addColorStop(1, withAlpha(palette.accent, 0))
  fctx.fillStyle = ridge
  fctx.fillRect(0, 0, w, h)
  fctx.globalCompositeOperation = 'source-over'

  return full
}

function buildDeepLayer(w: number, h: number, palette: Palette, isDark: boolean): HTMLCanvasElement {
  const c = createOffscreen(w, h)
  const ctx = c.getContext('2d')!
  const area = (w * h) / (1280 * 720)
  const scale = Math.max(0.75, Math.min(1.5, area))
  const count = Math.round(1100 * scale)
  const strength = isDark ? 1 : 0.3
  const cool = rotateHue(palette.accent, -55, -0.1, 0.1)

  // Faint elliptical galaxy smudges
  const smudges = [
    { x: w * 0.18, y: h * 0.72, rx: 28, ry: 10, rot: -0.4 },
    { x: w * 0.88, y: h * 0.22, rx: 22, ry: 9, rot: 0.6 },
  ]
  for (const s of smudges) {
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(s.rot)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s.rx)
    g.addColorStop(0, withAlpha(palette.text, 0.12 * strength))
    g.addColorStop(0.4, withAlpha(cool, 0.06 * strength))
    g.addColorStop(1, withAlpha(cool, 0))
    ctx.fillStyle = g
    ctx.scale(1, s.ry / s.rx)
    ctx.beginPath()
    ctx.arc(0, 0, s.rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (let i = 0; i < count; i++) {
    // Rejection sampling toward the galactic band
    let x = 0
    let y = 0
    let accepted = false
    for (let tries = 0; tries < 6; tries++) {
      x = Math.random() * w
      y = Math.random() * h
      const mask = bandMask(x / w, y / h, w, h)
      if (Math.random() < 0.18 + mask * 0.82) {
        accepted = true
        break
      }
    }
    if (!accepted) {
      x = Math.random() * w
      y = Math.random() * h
    }

    const bright = Math.random()
    const r = bright > 0.97 ? 1.1 + Math.random() * 0.6 : bright > 0.85 ? 0.7 + Math.random() * 0.4 : 0.35 + Math.random() * 0.35
    const a =
      (bright > 0.97 ? 0.75 : bright > 0.7 ? 0.4 + bright * 0.25 : 0.12 + bright * 0.28) * strength

    let color = palette.text
    const roll = Math.random()
    if (roll < 0.12) color = palette.accent
    else if (roll < 0.28) color = cool
    else if (roll < 0.4) color = palette.textTertiary

    ctx.beginPath()
    ctx.fillStyle = withAlpha(color, a)
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return c
}

function seedLiveStars(w: number, h: number): LiveStar[] {
  const stars: LiveStar[] = []
  const area = (w * h) / (1280 * 720)
  const scale = Math.max(0.7, Math.min(1.4, area))
  const luminaries = Math.round(12 * scale)
  const field = Math.round(55 * scale)

  for (let i = 0; i < luminaries; i++) {
    let x = Math.random() * w
    let y = Math.random() * h
    // Prefer band
    for (let t = 0; t < 4; t++) {
      const tx = Math.random() * w
      const ty = Math.random() * h
      if (bandMask(tx / w, ty / h, w, h) > 0.25) {
        x = tx
        y = ty
        break
      }
    }
    stars.push({
      x,
      y,
      r: 1.7 + Math.random() * 1.5,
      depth: 0.78 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.3 + Math.random() * 0.65,
      tier: 2,
      accentMix: 0.5 + Math.random() * 0.5,
    })
  }
  for (let i = 0; i < field; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.9 + Math.random() * 1.05,
      depth: 0.45 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.5 + Math.random() * 1.1,
      tier: 1,
      accentMix: Math.random() * 0.55,
    })
  }
  return stars
}

function wrapDraw(
  ctx: CanvasRenderingContext2D,
  layer: HTMLCanvasElement,
  ox: number,
  oy: number,
  w: number,
  h: number,
  alpha: number,
) {
  const x = ((ox % w) + w) % w
  const y = ((oy % h) + h) % h
  ctx.globalAlpha = alpha
  ctx.drawImage(layer, x - w, y - h)
  ctx.drawImage(layer, x, y - h)
  ctx.drawImage(layer, x - w, y)
  ctx.drawImage(layer, x, y)
  ctx.globalAlpha = 1
}

export function Starfield({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeId = useThemeStore((s) => s.themeId)
  const isDark = getTheme(themeId).isDark
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars: LiveStar[] = []
    let nebulaLayer: HTMLCanvasElement | null = null
    let deepLayer: HTMLCanvasElement | null = null
    let torchCanvas: HTMLCanvasElement | null = null
    let torchCtx: CanvasRenderingContext2D | null = null
    let meteor: Meteor | null = null
    let nextMeteorAt = performance.now() + 6000 + Math.random() * 10000
    let palette = readPalette()
    let raf = 0
    let running = true
    let pointerX = 0.5
    let pointerY = 0.5
    let smoothPx = 0.5
    let smoothPy = 0.5
    let smoothIntensity = intensityRef.current
    let w = 0
    let h = 0
    const reduced = prefersReducedMotion()
    const themeAlpha = isDark ? 1 : 0.25

    const rebuildLayers = () => {
      palette = readPalette()
      nebulaLayer = buildNebulaLayer(w, h, palette, isDark)
      deepLayer = buildDeepLayer(w, h, palette, isDark)
      stars = seedLiveStars(w, h)
      const torchSize = Math.min(512, Math.max(256, Math.floor(Math.min(w, h) * 0.42)))
      torchCanvas = createOffscreen(torchSize, torchSize)
      torchCtx = torchCanvas.getContext('2d')
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rebuildLayers()
    }

    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX / Math.max(1, w)
      pointerY = e.clientY / Math.max(1, h)
    }

    let last = performance.now()

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else {
        running = true
        last = performance.now()
        if (!reduced) raf = requestAnimationFrame(frame)
      }
    }

    const themeObserver = new MutationObserver(() => {
      rebuildLayers()
      if (reduced) drawStatic()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style'],
    })

    const spawnMeteor = () => {
      const fromLeft = Math.random() > 0.35
      meteor = {
        x: fromLeft ? -40 : w * (0.15 + Math.random() * 0.55),
        y: Math.random() * h * 0.4,
        vx: fromLeft ? 5.5 + Math.random() * 3 : 3.4 + Math.random() * 2.2,
        vy: 1.8 + Math.random() * 2.2,
        life: 0,
        maxLife: 50 + Math.random() * 40,
      }
    }

    const drawStar = (
      x: number,
      y: number,
      s: LiveStar,
      alpha: number,
      color: string,
    ) => {
      if (s.tier >= 1 && alpha > 0.18) {
        const haloR = s.r * (s.tier === 2 ? 6 : 3.4)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, haloR)
        grad.addColorStop(0, withAlpha(color, alpha * (s.tier === 2 ? 0.5 : 0.3)))
        grad.addColorStop(0.35, withAlpha(color, alpha * 0.14))
        grad.addColorStop(1, withAlpha(color, 0))
        ctx.beginPath()
        ctx.fillStyle = grad
        ctx.arc(x, y, haloR, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.beginPath()
      ctx.fillStyle = withAlpha(color, Math.min(1, alpha))
      ctx.arc(x, y, s.r, 0, Math.PI * 2)
      ctx.fill()

      if (s.tier === 2 && alpha > 0.32) {
        const spike = s.r * 5
        ctx.strokeStyle = withAlpha(color, alpha * 0.38)
        ctx.lineWidth = 0.75
        ctx.beginPath()
        ctx.moveTo(x - spike, y)
        ctx.lineTo(x + spike, y)
        ctx.moveTo(x, y - spike * 0.75)
        ctx.lineTo(x, y + spike * 0.75)
        ctx.stroke()
      }
    }

    const drawFlashlight = (cursorX: number, cursorY: number, layerAlpha: number) => {
      if (!nebulaLayer || !torchCanvas || !torchCtx) return
      const size = torchCanvas.width
      const half = size / 2
      const srcX = Math.floor(cursorX - half)
      const srcY = Math.floor(cursorY - half)

      torchCtx.clearRect(0, 0, size, size)
      torchCtx.globalCompositeOperation = 'source-over'
      torchCtx.globalAlpha = 1
      // Sample nebula under the cursor (with wrap)
      for (const ox of [-w, 0, w]) {
        for (const oy of [-h, 0, h]) {
          torchCtx.drawImage(nebulaLayer, srcX + ox, srcY + oy)
        }
      }

      // Radial mask
      torchCtx.globalCompositeOperation = 'destination-in'
      const mask = torchCtx.createRadialGradient(half, half, 0, half, half, half)
      mask.addColorStop(0, 'rgba(255,255,255,1)')
      mask.addColorStop(0.45, 'rgba(255,255,255,0.65)')
      mask.addColorStop(1, 'rgba(255,255,255,0)')
      torchCtx.fillStyle = mask
      torchCtx.fillRect(0, 0, size, size)

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = Math.min(1, 0.85 * layerAlpha)
      ctx.drawImage(torchCanvas, cursorX - half, cursorY - half)
      ctx.restore()
    }

    const drawLiveStars = (
      now: number,
      px: number,
      py: number,
      cursorX: number,
      cursorY: number,
      layerAlpha: number,
      animate: boolean,
    ) => {
      const influenceR = Math.min(w, h) * 0.3
      for (const s of stars) {
        const parallax = (1.15 - s.depth) * 1
        const driftX = animate ? now * 0.006 * s.depth : 0
        const driftY = animate ? now * 0.003 * s.depth : 0
        const x =
          ((s.x + px * parallax + driftX) % (w + 24) + w + 24) % (w + 24) - 12
        const y =
          ((s.y + py * parallax + driftY) % (h + 24) + h + 24) % (h + 24) - 12

        const tw = animate
          ? 0.62 + 0.38 * Math.sin(now * 0.0011 * s.twinkle + s.phase)
          : 0.85
        const dx = x - cursorX
        const dy = y - cursorY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const near = Math.max(0, 1 - dist / influenceR)
        const proximityBoost = near * near * (isDark ? 0.6 : 0.22)
        const tierBase = s.tier === 2 ? 0.78 : 0.5
        const a = (tierBase + proximityBoost) * tw * themeAlpha * layerAlpha
        const color = mixColor(
          palette.text,
          palette.accent,
          Math.min(1, s.accentMix * 0.75 + near * 0.4),
        )
        drawStar(x, y, s, a, color)
      }
    }

    const drawStatic = () => {
      if (!nebulaLayer || !deepLayer) return
      ctx.clearRect(0, 0, w, h)
      const inten = intensityRef.current
      const layerA = themeAlpha * inten
      ctx.globalAlpha = 0.55 * layerA
      ctx.drawImage(nebulaLayer, 0, 0)
      ctx.globalAlpha = 0.9 * layerA
      ctx.drawImage(deepLayer, 0, 0)
      ctx.globalAlpha = 1
      drawLiveStars(0, 0, 0, w * 0.5, h * 0.4, inten, false)
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(32, now - last)
      last = now
      ctx.clearRect(0, 0, w, h)

      const ease = 1 - Math.exp(-dt * 0.012)
      smoothPx += (pointerX - smoothPx) * ease
      smoothPy += (pointerY - smoothPy) * ease
      smoothIntensity += (intensityRef.current - smoothIntensity) * (1 - Math.exp(-dt * 0.004))

      const inten = smoothIntensity
      const layerA = themeAlpha * inten

      // Parallax: nebula moves least, deep mid, live most
      const px = (smoothPx - 0.5) * 28
      const py = (smoothPy - 0.5) * 18
      const cursorX = smoothPx * w
      const cursorY = smoothPy * h

      if (nebulaLayer) {
        wrapDraw(
          ctx,
          nebulaLayer,
          now * 0.004 + px * 0.25,
          now * 0.002 + py * 0.2,
          w,
          h,
          0.55 * layerA,
        )
        drawFlashlight(cursorX, cursorY, layerA)
      }

      if (deepLayer) {
        wrapDraw(
          ctx,
          deepLayer,
          now * 0.012 + px * 0.55,
          now * 0.006 + py * 0.45,
          w,
          h,
          0.95 * layerA,
        )
      }

      drawLiveStars(now, px, py, cursorX, cursorY, inten, true)

      if (!meteor && now >= nextMeteorAt) {
        spawnMeteor()
        nextMeteorAt = now + 18000 + Math.random() * 22000
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
          const trail = 36
          const grad = ctx.createLinearGradient(
            meteor.x - meteor.vx * trail,
            meteor.y - meteor.vy * trail,
            meteor.x,
            meteor.y,
          )
          grad.addColorStop(0, withAlpha(palette.accent, 0))
          grad.addColorStop(0.4, withAlpha(palette.accent, 0.5 * fade * layerA))
          grad.addColorStop(1, withAlpha(palette.text, 0.95 * fade * layerA))
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.7
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(meteor.x - meteor.vx * trail, meteor.y - meteor.vy * trail)
          ctx.lineTo(meteor.x, meteor.y)
          ctx.stroke()

          const head = ctx.createRadialGradient(
            meteor.x,
            meteor.y,
            0,
            meteor.x,
            meteor.y,
            10,
          )
          head.addColorStop(0, withAlpha(palette.accent, 0.9 * fade * layerA))
          head.addColorStop(1, withAlpha(palette.accent, 0))
          ctx.fillStyle = head
          ctx.beginPath()
          ctx.arc(meteor.x, meteor.y, 10, 0, Math.PI * 2)
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
