import { WalletService } from '@/services/wallets'

export function bootstrapWalletFeature() {
  const walletService = new WalletService()
  return { walletService }
}
