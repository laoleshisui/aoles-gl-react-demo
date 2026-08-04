import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'zustand'],
  },
  optimizeDeps: {
    // Don't pre-bundle the locally-linked workspace packages, so Vite always
    // reads their fresh dist output instead of a stale .vite/deps cache.
    exclude: ['@aoles-gl/react', '@aoles-gl/core'],
    // But the excluded packages still import these CommonJS deps. Force Vite to
    // pre-bundle them into ESM so the browser doesn't choke on the raw CJS
    // (e.g. use-sync-external-store's missing `default` export).
    include: ['zustand', 'use-sync-external-store/shim/with-selector'],
  },
  server: {
    port: 4009,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
