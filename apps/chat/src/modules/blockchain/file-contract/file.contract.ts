import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import type { PushFileInfosParams } from './types'
import { fileAbis } from './abis'
import { CONTRACT_ADDRESSES } from '../config/contracts'

export class FileContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.file })
  }

  pushFileInfos(payload: TransactionPayload<PushFileInfosParams>): Promise<string[]> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'pushFileInfos',
      abiData: fileAbis.pushFileInfos,
      inputData,
      feeType: 'sc'
    })
  }
}
