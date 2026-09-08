import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
