import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'

i18n
  .use(LanguageDetector) // tự detect từ localStorage, cookie hoặc browser
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'vi', // dùng nếu không detect được
    debug: true,
    interpolation: {
      escapeValue: false
    },
    detection: {
      // Cấu hình lưu ngôn ngữ vào localStorage
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n
