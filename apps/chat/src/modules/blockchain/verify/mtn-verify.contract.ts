import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { verifyAbis } from './abis'
import { CONTRACT_ADDRESSES } from '@/config'

export class VerifyContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.verify })
  }

  authenticatedWallets(payload: TransactionPayload<{ '': string }>) {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'authenticatedWallets',
      abiData: verifyAbis.authenticatedWallets as any,
      feeType: 'read',
      inputData
    })
  }
}
