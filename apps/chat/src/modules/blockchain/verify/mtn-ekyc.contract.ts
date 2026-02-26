import { CONTRACT_ADDRESSES } from '@/config'
import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { ekycAbis } from './abis'

export class EkycContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.ekyc })
  }

  getUser(payload: TransactionPayload<{ user: string }>) {
    const { from, inputData } = payload
    return this.sendTransaction<{
      kycVerified: boolean
    }>({
      from,
      functionName: 'getUser',
      abiData: ekycAbis.getUser as any,
      feeType: 'read',
      inputData
    })
  }
}
