import { useCallback, useEffect, useRef, useState } from 'react'

const CHARGE_MS = 2600
const HIT_ME_URL = '/hit-me.html'

/**
 * Landing-only easter egg: a bright corner star that charges on hover/focus,
 * then opens Hit Me in a new tab on click.
 */
export function StarEgg() {
  const [charging, setCharging] = useState(false)
  const [ready, setReady] = useState(false)
  const [departing, setDeparting] = useState(false)
  const timerRef = useRef<number | null>(null)
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const beginCharge = useCallback(() => {
    if (ready || departing) return
    setCharging(true)
    clearTimer()
    const wait = reduced ? 400 : CHARGE_MS
    timerRef.current = window.setTimeout(() => {
      setReady(true)
      setCharging(false)
    }, wait)
  }, [ready, departing, reduced])

  const cancelCharge = useCallback(() => {
    if (ready) return
    clearTimer()
    setCharging(false)
  }, [ready])

  useEffect(() => () => clearTimer(), [])

  const openGame = () => {
    if (!ready) return
    setDeparting(true)
    window.open(HIT_ME_URL, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => {
      setDeparting(false)
      setReady(false)
      setCharging(false)
    }, 900)
  }

  return (
    <button
      type="button"
      className={`star-egg ${charging ? 'is-charging' : ''} ${ready ? 'is-ready' : ''} ${
        departing ? 'is-departing' : ''
      }`}
      aria-label={
        ready
          ? 'A game waits behind this star. Play Hit Me.'
          : 'A particularly bright star. Linger…'
      }
      title={ready ? 'Play a game' : undefined}
      onPointerEnter={beginCharge}
      onPointerLeave={cancelCharge}
      onFocus={beginCharge}
      onBlur={cancelCharge}
      onClick={openGame}
    >
      <span className="star-egg__halo" aria-hidden />
      <span className="star-egg__ping" aria-hidden />
      <span className="star-egg__ring" aria-hidden />
      <span className="star-egg__ring star-egg__ring--late" aria-hidden />
      <span className="star-egg__core" aria-hidden />
      <span className="star-egg__spike star-egg__spike--h" aria-hidden />
      <span className="star-egg__spike star-egg__spike--v" aria-hidden />
      {ready && (
        <span className="star-egg__hint" aria-hidden>
          play?
        </span>
      )}
    </button>
  )
}
