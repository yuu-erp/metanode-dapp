import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'

const callEngineRoot = path.resolve(__dirname, '../call/src/call')

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    // devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['@metanodejs/system-core', '@mtnts/contract-client'],
  },
  server: {
    port: 5731,
    host: '0.0.0.0',
  },
  resolve: {
    dedupe: ['@metanodejs/system-core', '@mtnts/contract-client'],
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      {
        find: '@app/call',
        replacement: path.resolve(__dirname, 'src/bridges/app-call.ts'),
      },
      { find: /^~\//, replacement: `${callEngineRoot}/` },
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      {
        find: 'react-dom',
        replacement: path.resolve(__dirname, 'node_modules/react-dom'),
      },
      {
        find: '@tanstack/react-query',
        replacement: path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
      },
      {
        find: '@tanstack/react-query-core',
        replacement: path.resolve(__dirname, 'node_modules/@tanstack/react-query-core'),
      },
    ],
  },
})
