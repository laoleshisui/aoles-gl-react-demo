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
    // The linked package still imports these runtime and peer dependencies.
    // Pre-bundle their CommonJS modules before the browser loads the package.
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'antd',
      '@ant-design/icons',
      'zustand',
    ],
  },
  server: {
    port: 4009,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
