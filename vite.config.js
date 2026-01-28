import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './frontend',
  base: '/todo/',
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 5173
    }
  }
})
