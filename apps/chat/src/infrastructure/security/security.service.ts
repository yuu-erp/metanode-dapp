import { decryptAesECDH, encryptAesECDH } from '@metanodejs/system-core'
import type { SecurityRepository } from './security.repository'

export class SecurityService implements SecurityRepository {
  async decryptAesECDH<T = string>(
    publicKey: string,
    address: string,
    encryptedContent: string
  ): Promise<T> {
    return (await decryptAesECDH(publicKey, address, encryptedContent)).value
  }

  async encryptAesECDH(
    publicKey: string,
    address: string,
    content: string
  ): Promise<{ value: string; publicKeyLocal: string }> {
    return encryptAesECDH(publicKey, address, content)
  }

  encodeBase64(str: string): string {
    const utf8Bytes = new TextEncoder().encode(str) // Uint8Array
    let binary = ''
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)))
    return btoa(binary)
  }

  decodeBase64(base64: string): string {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  }
}
