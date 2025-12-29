export interface SecurityRepository {
  encryptAesECDH(
    publicKey: string,
    address: string,
    content: string
  ): Promise<{ value: string; publicKeyLocal: string }>
  decryptAesECDH<T = string>(
    publicKey: string,
    address: string,
    encryptedContent: string
  ): Promise<T>
  encodeBase64(str: string): string
  decodeBase64(base64: string): string
}
