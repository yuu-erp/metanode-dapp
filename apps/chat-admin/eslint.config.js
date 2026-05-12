import boundaries from 'eslint-plugin-boundaries'
import importPlugin from 'eslint-plugin-import'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    // ⚠️ BẮT BUỘC
    files: ['src/**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },

    plugins: {
      boundaries,
      import: importPlugin,
      '@typescript-eslint': tseslint
    },

    // ⚠️ BẮT BUỘC – boundaries đọc từ đây
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      },

      'boundaries/elements': [
        // -----------------------------
        // Business / domain modules
        // -----------------------------
        { type: 'wallet', pattern: 'src/modules/wallet', mode: 'folder' },
        { type: 'account', pattern: 'src/modules/account', mode: 'folder' },
        { type: 'blockchain', pattern: 'src/modules/blockchain', mode: 'folder' },
        { type: 'conversation', pattern: 'src/modules/conversation', mode: 'folder' }, // conversation/chat module
        { type: 'message', pattern: 'src/modules/message', mode: 'folder' },
        { type: 'sync', pattern: 'src/modules/sync', mode: 'folder' },

        // -----------------------------
        // Core / infra
        // -----------------------------
        { type: 'infra', pattern: 'src/infrastructure/**', mode: 'folder' },
        { type: 'infra', pattern: 'src/container.ts', mode: 'file' },

        // -----------------------------
        // Features (UI + hooks)
        // -----------------------------
        { type: 'feature', pattern: 'src/features/**', mode: 'folder' },

        // -----------------------------
        // Shared modules / UI
        // -----------------------------
        { type: 'ui', pattern: 'src/shared/components/**', mode: 'folder' },
        { type: 'ui-hooks', pattern: 'src/shared/hooks/**', mode: 'folder' },
        { type: 'shared-utils', pattern: 'src/shared/utils/**', mode: 'folder' },
        { type: 'shared-lib', pattern: 'src/shared/lib/**', mode: 'folder' },

        // -----------------------------
        // Routes
        // -----------------------------
        { type: 'routes', pattern: 'src/routes/**', mode: 'folder' }
      ]
    },

    rules: {
      /**
       * DEBUG – BẮT BUỘC GIỮ TRONG GIAI ĐOẠN SETUP
       * File không match element nào sẽ FAIL
       */
      'boundaries/no-unknown': 'error',

      /**
       * ARCHITECTURE RULE
       */
      'boundaries/elements': [
        // -----------------------------
        // Business / domain modules
        // -----------------------------
        { type: 'wallet', pattern: 'src/modules/wallet', mode: 'folder' },
        { type: 'account', pattern: 'src/modules/account', mode: 'folder' },
        { type: 'blockchain', pattern: 'src/modules/blockchain', mode: 'folder' },
        { type: 'chat', pattern: 'src/modules/conversation', mode: 'folder' }, // conversation/chat module
        { type: 'message', pattern: 'src/modules/message', mode: 'folder' },
        { type: 'sync', pattern: 'src/modules/sync', mode: 'folder' },

        // -----------------------------
        // Core / infra
        // -----------------------------
        { type: 'infra', pattern: 'src/infrastructure/**', mode: 'folder' },
        { type: 'infra', pattern: 'src/container.ts', mode: 'file' },

        // -----------------------------
        // Features (UI + hooks)
        // -----------------------------
        { type: 'feature', pattern: 'src/features/**', mode: 'folder' },

        // -----------------------------
        // Shared modules / UI
        // -----------------------------
        { type: 'ui', pattern: 'src/shared/components/**', mode: 'folder' },
        { type: 'ui-hooks', pattern: 'src/shared/hooks/**', mode: 'folder' },
        { type: 'shared-utils', pattern: 'src/shared/utils/**', mode: 'folder' },
        { type: 'shared-lib', pattern: 'src/shared/lib/**', mode: 'folder' },

        // -----------------------------
        // Routes
        // -----------------------------
        { type: 'routes', pattern: 'src/routes/**', mode: 'folder' }
      ],

      'import/no-cycle': ['error', { maxDepth: 1 }]
    }
  }
]
