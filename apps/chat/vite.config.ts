import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
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
    host: '0.0.0.0'
  },
  resolve: {
    dedupe: ['@metanodejs/system-core'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
      '@tanstack/react-query-core': path.resolve(
        __dirname,
        'node_modules/@tanstack/react-query-core'
      )
    }
  }
})
