import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './kit/tokens.css'
import { hydrateThemeStore, initTheme } from './kit/theme'
import App from './App'

initTheme()
hydrateThemeStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
