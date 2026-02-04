import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { groupAbis } from './abis'

export class GroupContract extends MtnContract {
  constructor() {
    super({ to: '' })
  }

  admin(payload: TransactionPayload) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'admin',
      abiData: groupAbis.admin,
      feeType: 'read'
    })
  }
}
