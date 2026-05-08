export default {
  plugins: {
    // 1️⃣ Convert oklch → rgb (cho WebView)
    'postcss-preset-env': {
      stage: 3,
      features: {
        'color-function': true,
        'oklab-function': true
      }
    },

    // 2️⃣ Tailwind v4 PostCSS plugin (plugin MỚI)
    '@tailwindcss/postcss': {},

    // 3️⃣ Prefix cho WebView cũ
    autoprefixer: {}
  }
}
