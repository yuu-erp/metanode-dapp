import { decodeAbi } from '@metanodejs/system-core'
import type { DecodedAbiResult, IDecodeAbiRepository } from './decode-abi.repository'
import { ManageAbiEvent } from './manage-abi-event'

export class DecodeAbi extends ManageAbiEvent implements IDecodeAbiRepository {
  constructor() {
    super()
  }

  /**
   * Giải mã dữ liệu log dựa trên hash và raw input.
   * @param hash Hash của event signature
   * @param raw Dữ liệu raw của log (hex string)
   * @returns Object chứa dữ liệu giải mã và tên event
   * @throws Error nếu hash không tồn tại hoặc raw không hợp lệ
   */
  async decodeAbi(hash: string, raw: string): Promise<DecodedAbiResult> {
    if (!hash || !raw || typeof hash !== 'string' || typeof raw !== 'string') {
      throw new Error('Invalid input: hash and raw must be non-empty strings')
    }

    const abiData = this.getAbiData(hash)
    if (!abiData) {
      throw new Error(`ABI event for hash ${hash} not found`)
    }

    try {
      const decodedData = await decodeAbi({
        functionName: abiData.functionName,
        outputs: abiData.nonIndexedInputs,
        rawInput: raw
      })

      return {
        decodedData: decodedData as Record<string, unknown>,
        event: abiData.functionName
      }
    } catch (error) {
      throw new Error(`Failed to decode ABI for hash ${hash}: ${(error as Error).message}`)
    }
  }
}
