import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5174
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query', '@tanstack/react-query-core'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
