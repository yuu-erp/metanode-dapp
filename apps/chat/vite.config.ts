import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

const callEngineRoot = path.resolve(__dirname, '../call/src/call')
const pureRoot = path.resolve(__dirname, 'pure')

/** Dev-only manual test — production build must never load files under `pure/`. */
function excludePureFromProductionBuild(): Plugin {
  return {
    name: 'exclude-pure-from-production-build',
    apply: 'build',
    load(id) {
      const normalized = path.normalize(id)
      if (normalized === pureRoot || normalized.startsWith(`${pureRoot}${path.sep}`)) {
        throw new Error(`[vite build] \`pure/\` is dev-only and must not be bundled: ${normalized}`)
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  plugins: [
    excludePureFromProductionBuild(),
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
