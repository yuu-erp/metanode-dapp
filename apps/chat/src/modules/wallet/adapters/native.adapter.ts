import {
  decryptAesECDH,
  encryptAesECDH,
  getAllWallets,
  getDAppByBundleId,
  getEncryptedPublicKey,
  openDapp
} from '@metanodejs/system-core'
import type { Wallet, WalletAdapter } from '../wallet.types'

const WALLET_BUNDLE_ID = 'meta.wallet'

export class NativeWalletAdapter implements WalletAdapter {
  private async openWalletDApp(urlSuffix: string) {
    const dapp = await getDAppByBundleId(WALLET_BUNDLE_ID)
    return openDapp({
      ...dapp,
      urlSuffix
    })
  }

  getAllWallets(): Promise<Wallet[]> {
    return getAllWallets()
  }

  async getEncryptedPublicKey(address: string): Promise<string> {
    return (await getEncryptedPublicKey(address)).encryptedPublicKey
  }
  openCreateWallet(): Promise<void> {
    return this.openWalletDApp('/#/wallet/add?from=dapp&type=create')
  }

  openImportWallet(): Promise<void> {
    return this.openWalletDApp('/#/wallet/add?from=dapp&type=import')
  }

  encryptMessage(
    publicKey: string,
    address: string,
    message: string
  ): Promise<{
    value: string
    publicKeyLocal: string
  }> {
    return encryptAesECDH(publicKey, address, message)
  }

  async decryptMessage(publicKey: string, address: string, message: string): Promise<string> {
    return decryptAesECDH(publicKey, address, message)
  }
}
