import { decryptAesECDH, encryptAesECDH } from '@metanodejs/system-core'
import type { Scurity } from '../interfaces'

export class ScurityService implements Scurity {
  async encryptAesECDH(
    publicKey: string,
    address: string,
    content: string
  ): Promise<{ value: string; publicKeyLocal: string }> {
    return encryptAesECDH(publicKey, address, content)
  }

  async decryptAesECDH(
    publicKey: string,
    address: string,
    encryptedContent: string
  ): Promise<string> {
    return decryptAesECDH(publicKey, address, encryptedContent)
  }
}
