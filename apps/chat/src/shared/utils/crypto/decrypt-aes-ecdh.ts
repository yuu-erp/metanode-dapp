import { decryptAesECDH as decryptAesECDHNative } from '@metanodejs/system-core'
export async function decryptAesECDH<T>(
  publicKey: string,
  address: string,
  encryptedContent: string
): Promise<T> {
  return (await decryptAesECDHNative(publicKey, address, encryptedContent)).value
}
