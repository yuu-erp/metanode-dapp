export interface Scurity {
  encryptAesECDH(
    publicKey: string,
    address: string,
    content: string
  ): Promise<{ value: string; publicKeyLocal: string }>

  decryptAesECDH(publicKey: string, address: string, encryptedContent: string): Promise<string>
}
