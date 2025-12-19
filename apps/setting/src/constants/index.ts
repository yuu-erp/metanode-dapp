import { images } from '@/assets/images'

export const MENU_LIST = [
  {
    titleKey: 'menu.general.title',
    contentKey: 'menu.general.content',
    path: '/general'
  },
  {
    titleKey: 'menu.node.title',
    contentKey: 'menu.node.content',
    path: '/node'
  },
  {
    titleKey: 'menu.sharedDapps.title',
    contentKey: 'menu.sharedDapps.content',
    path: '/shared-dapps'
  },
  {
    titleKey: 'menu.sharedWallets.title',
    contentKey: 'menu.sharedWallets.content',
    path: '/shared-wallets'
  },
  {
    titleKey: 'menu.wallpaper.title',
    contentKey: 'menu.wallpaper.content',
    path: '/wallpaper'
  },
  {
    titleKey: 'menu.notification.title',
    contentKey: 'menu.notification.content',
    path: '/notification'
  },
  {
    titleKey: 'menu.security.title',
    contentKey: 'menu.security.content',
    path: '/security'
  },
  {
    titleKey: 'menu.backupRestore.title',
    contentKey: 'menu.backupRestore.content',
    path: '/backup-restore'
  },
  {
    titleKey: 'menu.meAI.title',
    contentKey: 'menu.meAI.content',
    path: '/me-ai'
  }
]

export const CREATE_PROFILE_LIST_OPTION = [
  {
    title: 'Create a New Profile',
    content: 'Easily separates profile for specific purposes like working or entertainment.',
    img: images.addProfile,
    path: '/new-profile/create'
  },
  {
    title: 'Import an Existing Profile',
    content: 'Already have profile? Using backup file and password to import.',
    img: images.importProfile,
    path: '/new-profile/import'
  }
]

export const AVATAR_IMAGES = [
  'https://img.fi.ai/avatar_image/1.png',
  'https://img.fi.ai/avatar_image/2.png',
  'https://img.fi.ai/avatar_image/3.png',
  'https://img.fi.ai/avatar_image/4.png',
  'https://img.fi.ai/avatar_image/5.png',
  'https://img.fi.ai/avatar_image/6.png',
  'https://img.fi.ai/avatar_image/7.png',
  'https://img.fi.ai/avatar_image/8.png',
  'https://img.fi.ai/avatar_image/9.png',
  'https://img.fi.ai/avatar_image/10.png'
]
