import { useTranslation } from 'react-i18next'

export type Locale = 'en' | 'vi'

export function useI18N(namespaces: string[] = ['common']) {
  const { i18n, ...rest } = useTranslation([...namespaces, 'common'])
  const changeLanguage = (lang: Locale) => {
    i18n.changeLanguage(lang)
  }
  return { i18n, changeLanguage, ...rest }
}
