import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs keep the build portable: it works both as a GitHub
  // user site (/<file>) and as a project site (/<repository>/<file>).
  base: './',
  plugins: [react()],
  // Honor a PORT assigned by the harness (autoPort) instead of always grabbing
  // 5173, which may already be taken by another dev server.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    // Target a range that spans old Safari (needs -webkit-backdrop-filter) AND
    // modern Chromium/Edge (need the *standard* backdrop-filter). With the
    // default target the minifier kept only the -webkit- form, so the header
    // glass rendered in Safari but not Edge/Chrome. This keeps both.
    cssTarget: ['chrome80', 'edge80', 'firefox103', 'safari14'],
  },
})
