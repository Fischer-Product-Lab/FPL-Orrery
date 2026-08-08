import { useState } from 'react'
import { Button, Keycap } from '../kit/primitives'
import { formatVirtualTime, useDemoStore } from '../engine/store'
import type { Speed } from '../engine/types'

const speeds: Speed[] = [1, 8, 32]

export function DemoClock({
  compact = false,
  friendly = false,
}: {
  compact?: boolean
  /** Rosetta: human time label + demo controls behind disclosure */
  friendly?: boolean
}) {
  const playing = useDemoStore((s) => s.playing)
  const speed = useDemoStore((s) => s.speed)
  const activeSessionId = useDemoStore((s) => s.activeSessionId)
  const session = useDemoStore((s) =>
    s.activeSessionId ? s.sessions[s.activeSessionId] : null,
  )
  const play = useDemoStore((s) => s.play)
  const pause = useDemoStore((s) => s.pause)
  const setSpeed = useDemoStore((s) => s.setSpeed)
  const jumpToNextEvent = useDemoStore((s) => s.jumpToNextEvent)
  const skipAhead = useDemoStore((s) => s.skipAhead)
  const resetSession = useDemoStore((s) => s.resetSession)
  const [demoOpen, setDemoOpen] = useState(false)

  if (!session || !activeSessionId) return null

  const timeLabel = formatVirtualTime(session.virtualTimeMs)

  return (
    <div
      className={`flex flex-wrap items-center gap-2 border-t border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 ${
        compact || friendly ? 'text-[11px]' : ''
      }`}
    >
      {friendly ? (
        <span className="text-[var(--color-text-tertiary)]">
          time into task{' '}
          <span className="tabular text-[var(--color-accent)]">{timeLabel}</span>
        </span>
      ) : (
        <span className="tabular text-[var(--color-accent)]">t+{timeLabel}</span>
      )}
      <span className="text-[var(--color-text-tertiary)]">│</span>
      <Button
        variant="ghost"
        className="glint !px-2 !py-1"
        onClick={() => (playing ? pause() : play())}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? 'pause' : 'play'}
      </Button>

      {friendly ? (
        <>
          <Button
            variant="ghost"
            className="glint !px-2 !py-1"
            onClick={() => setDemoOpen((v) => !v)}
            aria-expanded={demoOpen}
          >
            {demoOpen ? 'hide demo' : 'demo'}
          </Button>
          {demoOpen && (
            <>
              <div className="flex items-center gap-1">
                {speeds.map((s) => (
                  <Button
                    key={s}
                    variant={speed === s ? 'primary' : 'ghost'}
                    className="glint !px-2 !py-1 tabular"
                    onClick={() => setSpeed(s)}
                  >
                    {s}×
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="glint !px-2 !py-1"
                onClick={jumpToNextEvent}
              >
                next
              </Button>
              <Button
                variant="ghost"
                className="glint !px-2 !py-1"
                onClick={() => skipAhead(4 * 3600 * 1000)}
              >
                skip 4h
              </Button>
              <Button
                variant="ghost"
                className="glint !px-2 !py-1"
                onClick={() => resetSession(activeSessionId)}
              >
                reset
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {speeds.map((s) => (
              <Button
                key={s}
                variant={speed === s ? 'primary' : 'ghost'}
                className="glint !px-2 !py-1 tabular"
                onClick={() => setSpeed(s)}
              >
                {s}×
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="glint !px-2 !py-1" onClick={jumpToNextEvent}>
            next event
          </Button>
          <Button
            variant="ghost"
            className="glint !px-2 !py-1"
            onClick={() => skipAhead(4 * 3600 * 1000)}
          >
            skip 4h
          </Button>
          <Button
            variant="ghost"
            className="glint !px-2 !py-1"
            onClick={() => resetSession(activeSessionId)}
          >
            reset
          </Button>
          {!compact && (
            <span className="ml-auto hidden items-center gap-2 text-[10px] text-[var(--color-text-tertiary)] sm:flex">
              demo clock <Keycap>space</Keycap> play/pause
            </span>
          )}
        </>
      )}
    </div>
  )
}
