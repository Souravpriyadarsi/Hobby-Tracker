import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Single source of truth for the version shown in Settings, so it can't
  // drift from package.json / Cargo.toml / tauri.conf.json.
  define: { __APP_VERSION__: JSON.stringify(version) },
  // Tauri expects a fixed port and fails if it is not available.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Don't watch the Rust side from the frontend dev server.
      ignored: ['**/src-tauri/**'],
    },
  },
})
