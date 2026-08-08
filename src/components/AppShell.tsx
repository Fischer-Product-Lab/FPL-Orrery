import { NavLink as RRNavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Starfield } from './Starfield'
import { NavLink } from '../kit/primitives'
import { ThemeSwitcher } from '../kit/ThemeSwitcher'
import { useThemeStore } from '../kit/theme'
import { allScripts } from '../scripts'
import { useDemoStore } from '../engine/store'

const links = [
  { to: '/', label: 'Index', end: true },
  { to: '/console', label: 'Console' },
  { to: '/rosetta', label: 'Rosetta' },
  { to: '/observatory', label: 'Observatory' },
  { to: '/terminal', label: 'Terminal' },
  { to: '/mobile', label: 'Mobile' },
  { to: '/patterns', label: 'Patterns' },
  { to: '/study', label: 'Study' },
]

export function AppShell() {
  const location = useLocation()
  const initScripts = useDemoStore((s) => s.initScripts)
  const tick = useDemoStore((s) => s.tick)
  const playing = useDemoStore((s) => s.playing)
  const play = useDemoStore((s) => s.play)
  const pause = useDemoStore((s) => s.pause)
  const initialized = useDemoStore((s) => Object.keys(s.scripts).length > 0)

  useEffect(() => {
    if (!initialized) initScripts(allScripts)
  }, [initialized, initScripts])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const loop = (now: number) => {
      tick(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, tick])

  const cycleTheme = useThemeStore((s) => s.cycle)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        if (playing) pause()
        else play()
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        cycleTheme()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, play, pause, cycleTheme])

  const hideChrome =
    location.pathname.startsWith('/terminal') ||
    location.pathname.startsWith('/mobile') ||
    location.pathname.startsWith('/observatory')

  // Full atmosphere on the landing hero; quiet elsewhere so dense pages stay readable.
  const isLanding = location.pathname === '/'
  const starIntensity = isLanding ? 1 : 0.45

  return (
    <div className="grain relative flex min-h-screen flex-col">
      {/* Landing uses a CSS hero-torch above the grid; canvas flashlight would hard-clip under content. */}
      <Starfield intensity={starIntensity} flashlight={!isLanding} />
      <div className="relative z-10 flex min-h-screen flex-col">
        {!hideChrome && (
          <header className="sticky top-0 z-30 border-b border-[var(--color-hairline)] bg-[var(--color-bg)]/85 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
              <RRNavLink to="/" className="flex items-baseline gap-2">
                <span className="text-[13px] tracking-[0.2em] text-[var(--color-accent)]">
                  ORRERY
                </span>
                <span className="hidden text-[11px] text-[var(--color-text-tertiary)] sm:inline">
                  mission control for agents
                </span>
              </RRNavLink>
              <nav className="ml-auto flex flex-wrap items-center gap-4">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    active={
                      l.end
                        ? location.pathname === l.to
                        : location.pathname.startsWith(l.to)
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <ThemeSwitcher />
              </nav>
            </div>
          </header>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
