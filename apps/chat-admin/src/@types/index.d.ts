export {}
declare global {
  interface Window {
    finSdk?: any
  }
  interface Wallet {
    backgroundImage: string
    name: string
    address: string
  }
}
