import type { Wallet as NativeWallet } from '@metanodejs/system-core'

export interface Wallet extends NativeWallet {}

export interface WalletAdapter {
  getAllWallets(): Promise<Wallet[]>
  getEncryptedPublicKey(address: string): Promise<string>
  openCreateWallet(): Promise<void>
  openImportWallet(): Promise<void>
  encryptMessage(
    publicKey: string,
    address: string,
    message: string
  ): Promise<{
    value: string
    publicKeyLocal: string
  }>
  decryptMessage(publicKey: string, address: string, message: string): Promise<string>
}
