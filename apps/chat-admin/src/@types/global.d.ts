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
}
