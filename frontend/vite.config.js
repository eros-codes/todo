// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({

  base: '/todo/',
  plugins: [react()],
  build: {
    outDir: 'docs',     // <-- خروجی حالا داخل frontend/docs خواهد بود
    emptyOutDir: true
  }
})
