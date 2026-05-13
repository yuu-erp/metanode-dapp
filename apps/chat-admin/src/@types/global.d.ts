export {}
declare global {
  interface Window {
    isHasNotch?: boolean
    finSdk?: any
    webkit?: any
    electronAPI?: any
  }
  interface Wallet {
    name: string
    address: string
    backgroundImage: string
  }

  interface User {
    name: string
    address: string
    role: string
    status: string
    lastUpdate: number
  }
}
