export {}
declare global {
  interface Window {
    isHasNotch?: boolean
    finSdk?: any
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
