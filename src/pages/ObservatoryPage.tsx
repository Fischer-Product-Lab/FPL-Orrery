import { Link } from 'react-router-dom'
import { DemoClock } from '../components/DemoClock'
import { OrreryScene } from '../components/orrery/OrreryScene'
import { Keycap, SectionLabel } from '../kit/primitives'
import { ThemeSwitcher } from '../kit/ThemeSwitcher'

export function ObservatoryPage() {
  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[13px] tracking-[0.2em] text-[var(--color-accent)]">
            ORRERY
          </Link>
          <SectionLabel>Observatory</SectionLabel>
        </div>
        <p className="thought hidden text-[14px] text-[var(--color-text-secondary)] md:block">
          Leave it on the wall. Stillness means you are needed.
        </p>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-tertiary)]">
          <span className="hidden sm:inline">
            click planet → console · <Keycap>space</Keycap> clock
          </span>
          <Link to="/console" className="text-[var(--color-accent)]">
            console
          </Link>
          <Link to="/rosetta" className="text-[var(--color-accent)]">
            rosetta
          </Link>
          <Link to="/" className="hover:text-[var(--color-text)]">
            index
          </Link>
          <ThemeSwitcher compact />
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <OrreryScene variant="full" />
        <div className="pointer-events-none absolute bottom-4 left-1/2 max-w-md -translate-x-1/2 px-4 text-center md:hidden">
          <p className="thought text-[13px] text-[var(--color-text-secondary)]">
            Leave it on the wall. Stillness means you are needed.
          </p>
        </div>
      </div>

      <DemoClock compact />
    </div>
  )
}
