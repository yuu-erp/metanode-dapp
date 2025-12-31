import { encryptAesECDH as encryptAesECDHNative } from '@metanodejs/system-core'
export async function encryptAesECDH(
  publicKey: string,
  address: string,
  content: string
): Promise<{ value: string; publicKeyLocal: string }> {
  return encryptAesECDHNative(publicKey, address, content)
}
