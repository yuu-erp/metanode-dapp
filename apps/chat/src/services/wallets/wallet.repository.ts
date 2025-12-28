import {
  getAllWallets,
  getDAppByBundleId,
  getEncryptedPublicKey,
  openDapp,
  type Wallet
} from '@metanodejs/system-core'

const WALLET_BUNDLE_ID = 'meta.wallet'

export class WalletRepository {
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

  getEncryptedPublicKey(address: string): Promise<{ encryptedPublicKey: string }> {
    return getEncryptedPublicKey(address)
  }
}
