import type { Wallet, WalletAdapter } from './wallet.types'

export class WalletService {
  constructor(private readonly walletAdapter: WalletAdapter) {}

  openCreateWallet() {
    return this.walletAdapter.openCreateWallet()
  }

  openImportWallet() {
    return this.walletAdapter.openImportWallet()
  }

  getAllWallets(): Promise<Wallet[]> {
    return this.walletAdapter.getAllWallets()
  }

  getEncryptedPublicKey(address: string): Promise<string> {
    return this.walletAdapter.getEncryptedPublicKey(address)
  }

  async encryptMessage(publicKey: string, address: string, message: string): Promise<string> {
    return (await this.walletAdapter.encryptMessage(publicKey, address, message)).value
  }

  async decryptMessage<T = unknown>(
    publicKey: string,
    address: string,
    message: string
  ): Promise<T> {
    const decrypted = await this.walletAdapter.decryptMessage<string>(publicKey, address, message)

    try {
      const parsed = JSON.parse(decrypted)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as T
      }

      return decrypted as unknown as T
    } catch {
      return decrypted as unknown as T
    }
  }
}
