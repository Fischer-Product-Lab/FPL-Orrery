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

/** Observatory first, Everforest Light last; middle alphabetical by name */
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
    id: 'andromeda',
    name: 'Andromeda',
    tagline: 'Nebula fuchsia on void (our pick)',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Sora:wght@400;500;600&display=swap',
    tokens: {
      '--color-bg': '#0b0614',
      '--color-surface': '#140c22',
      '--color-surface-raised': '#1e1432',
      '--color-hairline': 'rgba(232, 212, 255, 0.12)',
      '--color-hairline-strong': 'rgba(232, 212, 255, 0.22)',
      '--color-text': '#ede4ff',
      '--color-text-secondary': '#b8a0d8',
      '--color-text-tertiary': '#6e5a88',
      '--color-accent': '#e879f9',
      '--color-accent-dim': 'rgba(232, 121, 249, 0.14)',
      '--color-accent-glow': 'rgba(232, 121, 249, 0.30)',
      '--color-success': '#34d399',
      '--color-success-dim': 'rgba(52, 211, 153, 0.14)',
      '--color-danger': '#fb7185',
      '--color-danger-dim': 'rgba(251, 113, 133, 0.14)',
      '--color-warning': '#fbbf24',
      '--color-warning-dim': 'rgba(251, 191, 36, 0.14)',
      '--font-serif': sansStack('Sora'),
      '--font-mono': monoStack('JetBrains Mono'),
    },
  },
  {
    id: 'aura-spirit-dracula',
    name: 'Aura Spirit Dracula',
    tagline: 'Aura soft void, Dracula spirit purple',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Manrope:wght@400;500;600&display=swap',
    tokens: {
      '--color-bg': '#140e1a',
      '--color-surface': '#191120',
      '--color-surface-raised': '#2e2b38',
      '--color-hairline': 'rgba(237, 236, 238, 0.10)',
      '--color-hairline-strong': 'rgba(237, 236, 238, 0.20)',
      '--color-text': '#edecee',
      '--color-text-secondary': '#cdccce',
      '--color-text-tertiary': '#64548e',
      '--color-accent': '#a277ff',
      '--color-accent-dim': 'rgba(162, 119, 255, 0.14)',
      '--color-accent-glow': 'rgba(162, 119, 255, 0.30)',
      '--color-success': '#61ffca',
      '--color-success-dim': 'rgba(97, 255, 202, 0.14)',
      '--color-danger': '#ff6767',
      '--color-danger-dim': 'rgba(255, 103, 103, 0.14)',
      '--color-warning': '#ffca85',
      '--color-warning-dim': 'rgba(255, 202, 133, 0.14)',
      '--font-serif': sansStack('Manrope'),
      '--font-mono': monoStack('Fira Code'),
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
    id: 'catppuccin',
    name: 'Catppuccin',
    tagline: 'Mocha mauve, soft pastels',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:ital,wght@0,400;0,500;0,600;1,400&display=swap',
    tokens: {
      '--color-bg': '#1e1e2e',
      '--color-surface': '#181825',
      '--color-surface-raised': '#313244',
      '--color-hairline': 'rgba(205, 214, 244, 0.12)',
      '--color-hairline-strong': 'rgba(205, 214, 244, 0.22)',
      '--color-text': '#cdd6f4',
      '--color-text-secondary': '#a6adc8',
      '--color-text-tertiary': '#6c7086',
      '--color-accent': '#cba6f7',
      '--color-accent-dim': 'rgba(203, 166, 247, 0.14)',
      '--color-accent-glow': 'rgba(203, 166, 247, 0.28)',
      '--color-success': '#a6e3a1',
      '--color-success-dim': 'rgba(166, 227, 161, 0.14)',
      '--color-danger': '#f38ba8',
      '--color-danger-dim': 'rgba(243, 139, 168, 0.14)',
      '--color-warning': '#f9e2af',
      '--color-warning-dim': 'rgba(249, 226, 175, 0.14)',
      '--font-serif': sansStack('Nunito'),
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
    id: 'deep-dark-space',
    name: 'Deep Dark Space',
    tagline: 'Near-black void, starlight blue',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
    tokens: {
      '--color-bg': '#02040a',
      '--color-surface': '#070b14',
      '--color-surface-raised': '#0d1422',
      '--color-hairline': 'rgba(158, 193, 255, 0.10)',
      '--color-hairline-strong': 'rgba(158, 193, 255, 0.20)',
      '--color-text': '#d0dcf0',
      '--color-text-secondary': '#8494b0',
      '--color-text-tertiary': '#4a5670',
      '--color-accent': '#9ec1ff',
      '--color-accent-dim': 'rgba(158, 193, 255, 0.12)',
      '--color-accent-glow': 'rgba(158, 193, 255, 0.26)',
      '--color-success': '#6bcf9a',
      '--color-success-dim': 'rgba(107, 207, 154, 0.12)',
      '--color-danger': '#ff5a6a',
      '--color-danger-dim': 'rgba(255, 90, 106, 0.14)',
      '--color-warning': '#e0b45c',
      '--color-warning-dim': 'rgba(224, 180, 92, 0.12)',
      '--font-serif': serifStack('Spectral'),
      '--font-mono': monoStack('IBM Plex Mono'),
    },
  },
  {
    id: 'dracula-redefined',
    name: 'Dracula Redefined',
    tagline: 'Deeper void, hotter pink',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Outfit:wght@400;500;600&display=swap',
    tokens: {
      '--color-bg': '#0d0f17',
      '--color-surface': '#151822',
      '--color-surface-raised': '#1e2230',
      '--color-hairline': 'rgba(248, 248, 242, 0.10)',
      '--color-hairline-strong': 'rgba(248, 248, 242, 0.20)',
      '--color-text': '#f8f8f2',
      '--color-text-secondary': '#a8b2d1',
      '--color-text-tertiary': '#6272a4',
      '--color-accent': '#ff6ac1',
      '--color-accent-dim': 'rgba(255, 106, 193, 0.14)',
      '--color-accent-glow': 'rgba(255, 106, 193, 0.30)',
      '--color-success': '#50fa7b',
      '--color-success-dim': 'rgba(80, 250, 123, 0.14)',
      '--color-danger': '#ff5555',
      '--color-danger-dim': 'rgba(255, 85, 85, 0.14)',
      '--color-warning': '#ffb86c',
      '--color-warning-dim': 'rgba(255, 184, 108, 0.14)',
      '--font-serif': sansStack('Outfit'),
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
    id: 'gruvbox',
    name: 'Gruvbox',
    tagline: 'Warm earth, retro yellow',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inconsolata:wght@400;500;600&display=swap',
    tokens: {
      '--color-bg': '#282828',
      '--color-surface': '#3c3836',
      '--color-surface-raised': '#504945',
      '--color-hairline': 'rgba(235, 219, 178, 0.12)',
      '--color-hairline-strong': 'rgba(235, 219, 178, 0.22)',
      '--color-text': '#ebdbb2',
      '--color-text-secondary': '#d5c4a1',
      '--color-text-tertiary': '#928374',
      '--color-accent': '#fabd2f',
      '--color-accent-dim': 'rgba(250, 189, 47, 0.14)',
      '--color-accent-glow': 'rgba(250, 189, 47, 0.28)',
      '--color-success': '#b8bb26',
      '--color-success-dim': 'rgba(184, 187, 38, 0.14)',
      '--color-danger': '#fb4934',
      '--color-danger-dim': 'rgba(251, 73, 52, 0.14)',
      '--color-warning': '#fe8019',
      '--color-warning-dim': 'rgba(254, 128, 25, 0.14)',
      '--font-serif': serifStack('IBM Plex Serif'),
      '--font-mono': monoStack('Inconsolata'),
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
    id: 'neon-city',
    name: 'Neon City',
    tagline: 'Rain-slick night, magenta / cyan',
    isDark: true,
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&family=Share+Tech+Mono&display=swap',
    tokens: {
      '--color-bg': '#070012',
      '--color-surface': '#11001f',
      '--color-surface-raised': '#1a0030',
      '--color-hairline': 'rgba(0, 240, 255, 0.14)',
      '--color-hairline-strong': 'rgba(255, 43, 214, 0.28)',
      '--color-text': '#f2e8ff',
      '--color-text-secondary': '#b09ad0',
      '--color-text-tertiary': '#6e5688',
      '--color-accent': '#ff2bd6',
      '--color-accent-dim': 'rgba(255, 43, 214, 0.16)',
      '--color-accent-glow': 'rgba(0, 240, 255, 0.32)',
      '--color-success': '#39ff14',
      '--color-success-dim': 'rgba(57, 255, 20, 0.14)',
      '--color-danger': '#ff3366',
      '--color-danger-dim': 'rgba(255, 51, 102, 0.16)',
      '--color-warning': '#ffe600',
      '--color-warning-dim': 'rgba(255, 230, 0, 0.14)',
      '--font-serif': sansStack('Orbitron'),
      '--font-mono': monoStack('Share Tech Mono'),
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
