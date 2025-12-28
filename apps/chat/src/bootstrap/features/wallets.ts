import { WalletRepository, WalletService } from '@/services/wallets'

export function bootstrapWalletFeature() {
  const walletRepository = new WalletRepository()
  const walletService = new WalletService(walletRepository)
  return { walletService }
}
