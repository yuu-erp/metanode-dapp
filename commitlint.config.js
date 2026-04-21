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
    'header-max-length': [2, 'always', 200],
  },
}

export default config
