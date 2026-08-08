export type ThemeTokens = {
  '--color-bg': string
  '--color-surface': string
  '--color-surface-raised': string
  '--color-hairline': string
  '--color-hairline-strong': string
  '--color-text': string
  '--color-text-secondary': string
  '--color-text-tertiary': string
  '--color-accent': string
  '--color-accent-dim': string
  '--color-accent-glow': string
  '--color-success': string
  '--color-success-dim': string
  '--color-danger': string
  '--color-danger-dim': string
  '--color-warning': string
  '--color-warning-dim': string
  '--font-serif': string
  '--font-mono': string
}

export type ThemeDef = {
  id: string
  name: string
  tagline: string
  isDark: boolean
  /** Google Fonts CSS2 URL - omit when fonts already in index.html */
  fontsHref?: string
  tokens: ThemeTokens
}

const monoStack = (family: string) =>
  `"${family}", ui-monospace, "Cascadia Code", monospace`
const serifStack = (family: string) =>
  `"${family}", Georgia, "Times New Roman", serif`
const sansStack = (family: string) =>
  `"${family}", system-ui, sans-serif`

export const DEFAULT_THEME_ID = 'observatory'

/** Migrate retired theme ids */
export function resolveThemeId(id: string): string {
  if (id === 'vellum') return 'everforest-light'
  if (id === 'everforest') return 'tokyo-night'
  return id
}

export const themes: ThemeDef[] = [
  {
    id: 'observatory',
    name: 'Observatory',
    tagline: 'Precision instrument / phosphor amber',
    isDark: true,
    tokens: {
      '--color-bg': '#0b0a08',
      '--color-surface': '#121110',
      '--color-surface-raised': '#1a1917',
      '--color-hairline': 'rgba(255, 244, 224, 0.12)',
      '--color-hairline-strong': 'rgba(255, 244, 224, 0.22)',
      '--color-text': '#ede6d8',
      '--color-text-secondary': '#a39b8b',
      '--color-text-tertiary': '#6e675c',
      '--color-accent': '#ffb000',
      '--color-accent-dim': 'rgba(255, 176, 0, 0.14)',
      '--color-accent-glow': 'rgba(255, 176, 0, 0.28)',
      '--color-success': '#56a662',
      '--color-success-dim': 'rgba(86, 166, 98, 0.14)',
      '--color-danger': '#e5484d',
      '--color-danger-dim': 'rgba(229, 72, 77, 0.14)',
      '--color-warning': '#d4a017',
      '--color-warning-dim': 'rgba(212, 160, 23, 0.14)',
      '--font-serif': serifStack('Newsreader'),
      '--font-mono': monoStack('IBM Plex Mono'),
    },
  },
  {
    id: 'ayu-darkvenom',
    name: 'Ayu Darkvenom',
    tagline: 'Ayu dark base, venom-green accent',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600&display=swap',
    tokens: {
      '--color-bg': '#0a0e14',
      '--color-surface': '#0f1419',
      '--color-surface-raised': '#151a20',
      '--color-hairline': 'rgba(191, 189, 182, 0.12)',
      '--color-hairline-strong': 'rgba(191, 189, 182, 0.22)',
      '--color-text': '#bfbdb6',
      '--color-text-secondary': '#8a8680',
      '--color-text-tertiary': '#5c5852',
      '--color-accent': '#aad94c',
      '--color-accent-dim': 'rgba(170, 217, 76, 0.14)',
      '--color-accent-glow': 'rgba(170, 217, 76, 0.28)',
      '--color-success': '#7fd962',
      '--color-success-dim': 'rgba(127, 217, 98, 0.14)',
      '--color-danger': '#f07178',
      '--color-danger-dim': 'rgba(240, 113, 120, 0.14)',
      '--color-warning': '#ffb454',
      '--color-warning-dim': 'rgba(255, 180, 84, 0.14)',
      '--font-serif': sansStack('Space Grotesk'),
      '--font-mono': monoStack('JetBrains Mono'),
    },
  },
  {
    id: 'dark-phoenix',
    name: 'Dark Phoenix',
    tagline: 'Ember ground, flame accent',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=swap',
    tokens: {
      '--color-bg': '#100a08',
      '--color-surface': '#1a100c',
      '--color-surface-raised': '#241610',
      '--color-hairline': 'rgba(255, 200, 170, 0.12)',
      '--color-hairline-strong': 'rgba(255, 200, 170, 0.22)',
      '--color-text': '#f2e4d8',
      '--color-text-secondary': '#b89a88',
      '--color-text-tertiary': '#7a5e50',
      '--color-accent': '#ff5c33',
      '--color-accent-dim': 'rgba(255, 92, 51, 0.14)',
      '--color-accent-glow': 'rgba(255, 92, 51, 0.28)',
      '--color-success': '#6bbf6a',
      '--color-success-dim': 'rgba(107, 191, 106, 0.14)',
      '--color-danger': '#ff3b3b',
      '--color-danger-dim': 'rgba(255, 59, 59, 0.14)',
      '--color-warning': '#ffb454',
      '--color-warning-dim': 'rgba(255, 180, 84, 0.14)',
      '--font-serif': serifStack('Fraunces'),
      '--font-mono': monoStack('Fira Code'),
    },
  },
  {
    id: 'ethereal-omarchy',
    name: 'Ethereal Omarchy',
    tagline: 'Mist violet, ethereal accent',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Victor+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap',
    tokens: {
      '--color-bg': '#0e0d18',
      '--color-surface': '#151328',
      '--color-surface-raised': '#1c1a32',
      '--color-hairline': 'rgba(220, 210, 255, 0.12)',
      '--color-hairline-strong': 'rgba(220, 210, 255, 0.22)',
      '--color-text': '#e8e4f5',
      '--color-text-secondary': '#a8a0c4',
      '--color-text-tertiary': '#6e6688',
      '--color-accent': '#b4a0ff',
      '--color-accent-dim': 'rgba(180, 160, 255, 0.14)',
      '--color-accent-glow': 'rgba(180, 160, 255, 0.28)',
      '--color-success': '#7dcea0',
      '--color-success-dim': 'rgba(125, 206, 160, 0.14)',
      '--color-danger': '#ff6b9d',
      '--color-danger-dim': 'rgba(255, 107, 157, 0.14)',
      '--color-warning': '#e8c47c',
      '--color-warning-dim': 'rgba(232, 196, 124, 0.14)',
      '--font-serif': serifStack('Cormorant Garamond'),
      '--font-mono': monoStack('Victor Mono'),
    },
  },
  {
    id: 'material',
    name: 'Material',
    tagline: 'Material Darker - cyan on graphite',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,400;0,500;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap',
    tokens: {
      '--color-bg': '#212121',
      '--color-surface': '#2a2a2a',
      '--color-surface-raised': '#323232',
      '--color-hairline': 'rgba(238, 255, 255, 0.10)',
      '--color-hairline-strong': 'rgba(238, 255, 255, 0.20)',
      '--color-text': '#eeffff',
      '--color-text-secondary': '#b0bec5',
      '--color-text-tertiary': '#78909c',
      '--color-accent': '#89ddff',
      '--color-accent-dim': 'rgba(137, 221, 255, 0.14)',
      '--color-accent-glow': 'rgba(137, 221, 255, 0.28)',
      '--color-success': '#c3e88d',
      '--color-success-dim': 'rgba(195, 232, 141, 0.14)',
      '--color-danger': '#f07178',
      '--color-danger-dim': 'rgba(240, 113, 120, 0.14)',
      '--color-warning': '#ffcb6b',
      '--color-warning-dim': 'rgba(255, 203, 107, 0.14)',
      '--font-serif': sansStack('Roboto'),
      '--font-mono': monoStack('Roboto Mono'),
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Blue-black, moonlight accent',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
    tokens: {
      '--color-bg': '#050a16',
      '--color-surface': '#0a1224',
      '--color-surface-raised': '#101c32',
      '--color-hairline': 'rgba(143, 184, 232, 0.12)',
      '--color-hairline-strong': 'rgba(143, 184, 232, 0.22)',
      '--color-text': '#d8e4f4',
      '--color-text-secondary': '#8fa8c4',
      '--color-text-tertiary': '#5a6e88',
      '--color-accent': '#8fb8e8',
      '--color-accent-dim': 'rgba(143, 184, 232, 0.14)',
      '--color-accent-glow': 'rgba(143, 184, 232, 0.28)',
      '--color-success': '#5cb88a',
      '--color-success-dim': 'rgba(92, 184, 138, 0.14)',
      '--color-danger': '#e85a6a',
      '--color-danger-dim': 'rgba(232, 90, 106, 0.14)',
      '--color-warning': '#d4a84b',
      '--color-warning-dim': 'rgba(212, 168, 75, 0.14)',
      '--font-serif': serifStack('EB Garamond'),
      '--font-mono': monoStack('DM Mono'),
    },
  },
  {
    id: 'nousromancer',
    name: 'Nousromancer',
    tagline: 'Cyber ground, neon teal',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap',
    tokens: {
      '--color-bg': '#05080f',
      '--color-surface': '#0a101c',
      '--color-surface-raised': '#101828',
      '--color-hairline': 'rgba(0, 229, 208, 0.12)',
      '--color-hairline-strong': 'rgba(0, 229, 208, 0.22)',
      '--color-text': '#d0e8f0',
      '--color-text-secondary': '#7a9aaa',
      '--color-text-tertiary': '#4a6270',
      '--color-accent': '#00e5d0',
      '--color-accent-dim': 'rgba(0, 229, 208, 0.14)',
      '--color-accent-glow': 'rgba(0, 229, 208, 0.28)',
      '--color-success': '#3dd68c',
      '--color-success-dim': 'rgba(61, 214, 140, 0.14)',
      '--color-danger': '#ff2e6c',
      '--color-danger-dim': 'rgba(255, 46, 108, 0.14)',
      '--color-warning': '#ffcc00',
      '--color-warning-dim': 'rgba(255, 204, 0, 0.14)',
      '--font-serif': sansStack('Rajdhani'),
      '--font-mono': monoStack('Space Mono'),
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    tagline: 'Storm blue night, electric lilac',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap',
    tokens: {
      '--color-bg': '#1a1b26',
      '--color-surface': '#24283b',
      '--color-surface-raised': '#2f334d',
      '--color-hairline': 'rgba(169, 177, 214, 0.12)',
      '--color-hairline-strong': 'rgba(169, 177, 214, 0.22)',
      '--color-text': '#c0caf5',
      '--color-text-secondary': '#a9b1d6',
      '--color-text-tertiary': '#565f89',
      '--color-accent': '#7aa2f7',
      '--color-accent-dim': 'rgba(122, 162, 247, 0.14)',
      '--color-accent-glow': 'rgba(122, 162, 247, 0.28)',
      '--color-success': '#9ece6a',
      '--color-success-dim': 'rgba(158, 206, 106, 0.14)',
      '--color-danger': '#f7768e',
      '--color-danger-dim': 'rgba(247, 118, 142, 0.14)',
      '--color-warning': '#e0af68',
      '--color-warning-dim': 'rgba(224, 175, 104, 0.14)',
      '--font-serif': sansStack('IBM Plex Sans'),
      '--font-mono': monoStack('JetBrains Mono'),
    },
  },
  {
    id: 'everforest-light',
    name: 'Everforest Light',
    tagline: 'Soft sage daylight - the gentle light theme',
    isDark: false,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&display=swap',
    tokens: {
      '--color-bg': '#fdf6e3',
      '--color-surface': '#f4f0d9',
      '--color-surface-raised': '#efebd4',
      '--color-hairline': 'rgba(92, 106, 114, 0.14)',
      '--color-hairline-strong': 'rgba(92, 106, 114, 0.24)',
      '--color-text': '#5c6a72',
      '--color-text-secondary': '#708089',
      '--color-text-tertiary': '#939f91',
      '--color-accent': '#8da101',
      '--color-accent-dim': 'rgba(141, 161, 1, 0.12)',
      '--color-accent-glow': 'rgba(141, 161, 1, 0.22)',
      '--color-success': '#93b259',
      '--color-success-dim': 'rgba(147, 178, 89, 0.14)',
      '--color-danger': '#f85552',
      '--color-danger-dim': 'rgba(248, 85, 82, 0.12)',
      '--color-warning': '#dfa000',
      '--color-warning-dim': 'rgba(223, 160, 0, 0.14)',
      '--font-serif': serifStack('Source Serif 4'),
      '--font-mono': monoStack('Source Code Pro'),
    },
  },
]

export function getTheme(id: string): ThemeDef {
  const resolved = resolveThemeId(id)
  return themes.find((t) => t.id === resolved) ?? themes[0]
}

export function nextThemeId(currentId: string): string {
  const resolved = resolveThemeId(currentId)
  const i = themes.findIndex((t) => t.id === resolved)
  const next = themes[(i < 0 ? 0 : i + 1) % themes.length]
  return next.id
}
