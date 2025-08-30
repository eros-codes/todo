// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // اگر ریپو تو گیت‌هاب اسمش "todo" هست، این مقدار درست است.
  // اگر اسم ریپو چیز دیگری است، این خط را به `"/REPO_NAME/"` تغییر بده.
  base: '/todo/',
  plugins: [react()],
  build: {
    outDir: 'docs',     // <-- خروجی حالا داخل frontend/docs خواهد بود
    emptyOutDir: true
  }
})
