import type { IAbiEvent } from './manage-abi-event'

export interface DecodedAbiResult {
  decodedData: Record<string, unknown>
  event: string
}
export interface IDecodeAbiRepository {
  decodeAbi(hash: string, raw: string): Promise<DecodedAbiResult>
  registerAbi(abiEvents: IAbiEvent[]): Promise<void>
}
