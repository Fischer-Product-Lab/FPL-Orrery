import { create } from 'zustand'
import {
  DEFAULT_THEME_ID,
  getTheme,
  nextThemeId,
  resolveThemeId,
  themes,
  type ThemeDef,
  type ThemeTokens,
} from './themes'

const STORAGE_KEY = 'orrery-theme'
const FONT_LINK_ATTR = 'data-orrery-theme-font'

export type ThemeStore = {
  themeId: string
  setTheme: (id: string) => void
  cycle: () => void
}

function injectFonts(theme: ThemeDef) {
  if (!theme.fontsHref) return
  if (document.querySelector(`link[${FONT_LINK_ATTR}="${theme.id}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = theme.fontsHref
  link.setAttribute(FONT_LINK_ATTR, theme.id)
  document.head.appendChild(link)
}

function clearInlineTokens() {
  const root = document.documentElement
  const sample = themes[0].tokens
  for (const key of Object.keys(sample) as (keyof ThemeTokens)[]) {
    root.style.removeProperty(key)
  }
}

export function applyTheme(id: string) {
  const theme = getTheme(id)
  const root = document.documentElement

  if (theme.id === DEFAULT_THEME_ID) {
    clearInlineTokens()
  } else {
    for (const [key, value] of Object.entries(theme.tokens)) {
      root.style.setProperty(key, value)
    }
  }

  // Always apply fonts (including default when returning) so overrides clear correctly
  if (theme.id !== DEFAULT_THEME_ID) {
    root.style.setProperty('--font-serif', theme.tokens['--font-serif'])
    root.style.setProperty('--font-mono', theme.tokens['--font-mono'])
  } else {
    root.style.removeProperty('--font-serif')
    root.style.removeProperty('--font-mono')
  }

  root.style.colorScheme = theme.isDark ? 'dark' : 'light'
  root.dataset.theme = theme.id
  injectFonts(theme)

  try {
    localStorage.setItem(STORAGE_KEY, theme.id)
  } catch {
    /* ignore */
  }
}

/** Call before React mount to avoid flash of default theme */
export function initTheme() {
  let id = DEFAULT_THEME_ID
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const resolved = resolveThemeId(stored)
      if (themes.some((t) => t.id === resolved)) id = resolved
    }
  } catch {
    /* ignore */
  }
  applyTheme(id)
  return id
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themeId: DEFAULT_THEME_ID,
  setTheme: (id) => {
    const theme = getTheme(id)
    applyTheme(theme.id)
    set({ themeId: theme.id })
  },
  cycle: () => {
    const next = nextThemeId(get().themeId)
    applyTheme(next)
    set({ themeId: next })
  },
}))

/** Sync store with whatever initTheme applied */
export function hydrateThemeStore() {
  let id = DEFAULT_THEME_ID
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const resolved = resolveThemeId(stored)
      if (themes.some((t) => t.id === resolved)) id = resolved
    }
  } catch {
    /* ignore */
  }
  useThemeStore.setState({ themeId: id })
}

export function useActiveTheme(): ThemeDef {
  const themeId = useThemeStore((s) => s.themeId)
  return getTheme(themeId)
}
