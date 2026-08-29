/**
 * @type {import('@commitlint/types').UserConfig}
 *
 * Commit Message Format:
 *   <type>(<scope>): <emoji> <short summary>
 *
 * Emoji convention per type:
 *   ✨  feat     — new feature
 *   🐛  fix      — bug fix
 *   ♻️  refactor — code refactor
 *   🎨  style    — formatting, whitespace
 *   🧪  test     — add or update tests
 *   📝  docs     — documentation only
 *   🔧  chore    — build, tooling, deps
 *   ⚡️  perf     — performance improvement
 *   👷  ci       — CI/CD config changes
 *   ⏪️  revert   — revert a commit
 *
 * Examples:
 *   feat(launcher): ✨ add hero section with animated background.
 *   fix(contracts): 🐛 resolve reentrancy issue in withdraw function.
 *   chore(tooling): 🔧 upgrade ESLint to v9.
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'style', 'test', 'docs', 'chore', 'perf', 'ci', 'revert'],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'launcher', // ✨ apps/launcher-cyber
        'chat', // 💬 apps/chat
        'first-login', // 🔑 apps/first-login
        'setting', // ⚙️ apps/setting
        'packages', // 📦 shared packages
        'tooling', // 🔧 husky, eslint, tsconfig, etc.
        'contracts', // 📜 smart contracts
        'ui', // 🎨 shared UI components
        'deps', // ⬆️  dependency updates
        'ci', // 👷 CI/CD
        'release', // 🚀 versioning & changelogs
      ],
    ],
    'scope-empty': [1, 'never'], // warn if no scope
    'header-max-length': [2, 'always', 200],
    'body-max-line-length': [2, 'always', 200],
    'subject-full-stop': [0, 'never', '.'], // allow trailing period
  },
}

export default config
