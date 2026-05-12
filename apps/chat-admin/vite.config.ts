import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    // devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true
    }),
    viteReact(),
    tailwindcss()
  ],
  optimizeDeps: {
    exclude: ['@metanodejs/system-core']
  },
  server: {
    port: 5731,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 200
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
