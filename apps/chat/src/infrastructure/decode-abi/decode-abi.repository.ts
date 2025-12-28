export interface DecodedAbiResult {
  decodedData: Record<string, unknown>
  event: string
}
export interface IDecodeAbiRepository {
  decodeAbi(hash: string, raw: string): Promise<DecodedAbiResult>
}
