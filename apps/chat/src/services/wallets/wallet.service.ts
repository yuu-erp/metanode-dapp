import type { Wallet } from '@/services/wallets'
import {
  getAllWallets,
  getDAppByBundleId,
  getEncryptedPublicKey,
  openDapp
} from '@metanodejs/system-core'

const WALLET_BUNDLE_ID = 'meta.wallet'
export class WalletService {
  private async openWalletDApp(urlSuffix: string) {
    const dapp = await getDAppByBundleId(WALLET_BUNDLE_ID)
    return openDapp({
      ...dapp,
      urlSuffix
    })
  }

  openCreateWallet() {
    return this.openWalletDApp('/#/wallet/add?from=dapp&type=create')
  }

  openImportWallet() {
    return this.openWalletDApp('/#/wallet/add?from=dapp&type=import')
  }

  getAllWallets(): Promise<Wallet[]> {
    return getAllWallets()
  }

  async getEncryptedPublicKey(address: string): Promise<string> {
    return (await getEncryptedPublicKey(address)).encryptedPublicKey
  }
}
