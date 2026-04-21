import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintReact from '@eslint-react/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// @ts-expect-error — @eslint-react types don't expose .configs but it exists at runtime
const reactConfig = eslintReact.configs['recommended-type-checked']

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.output/**',
      '**/.vinxi/**',
      '**/.turbo/**',
      '**/.content-collections/**',
      '**/build/**',
      '**/*.min.js',
    ],
  },

  // ── Base JS rules (all files) ────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript rules (all .ts/.tsx) ─────────────────────────────────────────
  ...tseslint.configs.recommendedTypeChecked,

  // ── Root config files (not part of any tsconfig) ────────────────────────────
  // Must come AFTER recommendedTypeChecked so it wins in flat config cascade.
  // Disables type-aware rules for JS config files at the repo root (e.g.
  // .lintstagedrc.js, eslint.config.js) that are not included in any tsconfig.
  {
    files: ['*.js', '*.mjs', '*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // --- TypeScript ---
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      // Downgraded to warn: existing code uses content-collections
      // whose generated types aren't visible to ESLint's projectService
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/only-throw-error': 'off', // TanStack Router throws redirect() and notFound() objects

      // --- General JS quality ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // ── React rules (apps with JSX) ─────────────────────────────────────────────
  {
    files: ['apps/**/*.{ts,tsx}'],
    plugins: reactConfig.plugins,
    settings: reactConfig.settings,
    rules: {
      ...reactConfig.rules,
      '@eslint-react/no-leaked-conditional-rendering': 'warn',
      '@eslint-react/prefer-read-only-props': 'warn',
    },
  },

  // ── Disable format rules that conflict with Prettier (must be last) ──────────
  prettierConfig,
)
