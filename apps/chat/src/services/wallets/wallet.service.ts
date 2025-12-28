import type { Wallet } from '@/services/wallets'
import type { WalletRepository } from './wallet.repository'

export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async openCreateWallet() {
    return this.walletRepository.openCreateWallet()
  }

  async openImportWallet() {
    return this.walletRepository.openImportWallet()
  }

  async getAllWallets(): Promise<Wallet[]> {
    return await this.walletRepository.getAllWallets()
  }

  async getEncryptedPublicKey(address: string): Promise<string> {
    return (await this.walletRepository.getEncryptedPublicKey(address)).encryptedPublicKey
  }
}
