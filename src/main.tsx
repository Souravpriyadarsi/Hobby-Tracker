import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bundled so the desktop app keeps its typography with no network access.
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import App from './App.tsx'
import { applyTheme, useUiStore } from './store/useUiStore'

// Apply the persisted theme before first paint.
applyTheme(useUiStore.getState().theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
