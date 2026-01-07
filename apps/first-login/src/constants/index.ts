import { images } from '@/assets'
import raw from './regions-to-countries.json'

export interface Country {
  id: number
  name: string
  nameCode: string
  image: string
  country: string[]
  language: string
}
export const DATA_COUNTRY: Country[] = [
  {
    id: 0,
    name: 'English',
    nameCode: 'Britain',
    image: images.england,
    country: ['US', 'GB'],
    language: 'en-US'
  },
  {
    id: 1,
    name: 'Vietnamese',
    nameCode: 'Vietnam',
    image: images.vietnam,
    country: ['VN'],
    language: 'vi-VI'
  },
  {
    id: 2,
    // name: 'Japanese',
    name: '日本語',
    nameCode: 'Japan',
    image: images.japan,
    country: ['JP'],
    language: 'ja-JP'
  },
  {
    id: 3,
    name: '한국어',
    // name: 'Korean',
    nameCode: 'Korea_South',
    image: images.Korean,
    country: ['KP', 'KR'],
    language: 'ko-KR'
  },
  {
    id: 4,
    name: 'Español',
    // name: 'Spainish',
    nameCode: 'Spain',
    image: images.Spainish,
    country: ['ES'],
    language: 'es-ES'
  },
  {
    id: 5,
    name: '简体中文',
    // name: 'Chinese (Simplified)',
    nameCode: 'china',
    image: images.china,
    country: ['CN'],
    language: 'zh-CN'
  },
  {
    id: 6,
    name: '繁體中文',
    // name: 'Chinese (Tranditional)',
    nameCode: 'china_1',
    image: images.china,
    country: ['CN'],
    language: 'zh-HK'
  },
  {
    id: 7,
    // name: 'French',
    name: 'Français',
    nameCode: 'France',
    image: images.French,
    country: ['FR', 'GF', 'PF', 'TF'],
    language: 'fr-FR'
  },
  {
    id: 8,
    // name: 'Italia',
    name: 'Italiano',
    nameCode: 'Italy',
    image: images.italy,
    country: ['IT'],
    language: 'it-IT'
  },
  {
    id: 9,
    // name: 'Czech',
    name: 'Čeština',
    nameCode: 'Czech Republic',
    image: images.czech,
    country: ['CZ'],
    language: 'cs-CZ'
  },
  {
    id: 10,
    name: 'Português',
    // name: 'Portuguese',
    nameCode: 'Portugal',
    image: images.Portuguese,
    country: ['PT'],
    language: 'pt-BR'
  },
  {
    id: 11,
    // name: 'Indonesia',
    name: 'Bahasa Indonesia',
    nameCode: 'Indonesia',
    image: images.MaskGroup55,
    country: ['ID'],
    language: 'id-ID'
  }
]

export const regionsToCountries = raw as Record<string, string>

export const DEFAULT_CODE = '999999999'
