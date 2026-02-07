import {
  BadgePercent,
  BookCheck,
  CirclePoundSterling,
  Gamepad2,
  Languages,
  LayoutDashboard,
  LayoutTemplate,
  ListOrdered,
  MonitorCog,
  MonitorSmartphone,
  Notebook,
  ScanBarcode,
  UserCog,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet
} from 'lucide-react'

// Key dùng chung cho tất cả menu
const MENU_KEYS = {
  dashboard: 'navigation:dashboard',
  stations: 'navigation:stations',
  staffManagement: 'navigation:staffManagement',
  accounts: 'navigation:accounts',
  foods: 'navigation:foods',
  gameList: 'navigation:gameList',
  order: 'navigation:order',
  topup: 'navigation:topup',
  loyalty: 'navigation:loyalty',
  deviceSettings: 'navigation:deviceSettings',
  language: 'navigation:language',
  iqr: 'navigation:iqr',
  redeem: 'navigation:redeem',
  general: 'navigation:general',
  finance: 'navigation:finance',
  system: 'navigation:system',
  policy: 'navigation:policy',
  diary: 'navigation:diary',
  orderManagement: 'navigation:orderManagement'
} as const

// Menu USER
export const MENU_SIDEBAR_USER = [
  { labelKey: MENU_KEYS.gameList, path: '/user', icon: Gamepad2 },
  { labelKey: MENU_KEYS.order, path: '/user/order', icon: UtensilsCrossed },
  { labelKey: MENU_KEYS.topup, path: '/user/topup', icon: Wallet },
  { labelKey: MENU_KEYS.loyalty, path: '/user/loyalty', icon: BadgePercent },
  { labelKey: MENU_KEYS.deviceSettings, path: '/user/device', icon: MonitorCog },
  { labelKey: MENU_KEYS.language, path: '/language', icon: Languages }
] as const

// Menu MANAGER
export const MANAGER_MENU = [
  { labelKey: MENU_KEYS.dashboard, path: '/manager', icon: LayoutDashboard },
  { labelKey: MENU_KEYS.stations, path: '/manager/stations', icon: MonitorSmartphone },
  { labelKey: MENU_KEYS.staffManagement, path: '/manager/staffs', icon: Users },
  { labelKey: MENU_KEYS.gameList, path: '/manager/games', icon: Gamepad2 },
  { labelKey: MENU_KEYS.iqr, path: '/manager/iqr', icon: ScanBarcode },
  { labelKey: MENU_KEYS.loyalty, path: '/manager/loyalty', icon: BadgePercent },
  { labelKey: MENU_KEYS.language, path: '/language', icon: Languages }
] as const

// Menu STAFF
export const STAFF_MENU = [
  { labelKey: MENU_KEYS.dashboard, path: '/staff', icon: LayoutDashboard },
  { labelKey: MENU_KEYS.stations, path: '/staff/stations', icon: MonitorSmartphone },
  { labelKey: MENU_KEYS.accounts, path: '/staff/accounts', icon: UserCog },
  { labelKey: MENU_KEYS.orderManagement, path: '/staff/order', icon: ListOrdered },
  { labelKey: MENU_KEYS.language, path: '/language', icon: Languages }
] as const

export const OWNER_MENU = [
  { labelKey: MENU_KEYS.general, path: '/owner', icon: LayoutTemplate },
  { labelKey: MENU_KEYS.finance, path: '/owner/finance', icon: CirclePoundSterling },
  { labelKey: MENU_KEYS.system, path: '/owner/system', icon: UserRound },
  { labelKey: MENU_KEYS.policy, path: '/owner/policy', icon: BookCheck },
  { labelKey: MENU_KEYS.diary, path: '/owner/diary', icon: Languages },
  { labelKey: MENU_KEYS.language, path: '/language', icon: Notebook }
] as const

export const MENUS_BY_ROLE = {
  USER: MENU_SIDEBAR_USER,
  MANAGER: MANAGER_MENU,
  STAFF: STAFF_MENU,
  OWNER: OWNER_MENU
} as const
