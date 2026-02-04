import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  server: {
    strictPort: true,
  },
  build: {
    target: ['es2020'],
    minify: !process.env.TAURI_DEBUG,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
}))
