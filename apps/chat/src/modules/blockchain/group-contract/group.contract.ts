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
      abiData: groupAbis.admin as any,
      feeType: 'read'
    })
  }

  getMyEncryptedGroupKey(payload: TransactionPayload) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getMyEncryptedGroupKey',
      abiData: groupAbis.getMyEncryptedGroupKey as any,
      feeType: 'read'
    })
  }

  addMember(payload: TransactionPayload<{ user: string; encryptedKeyForNewMember: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'addMember',
      abiData: groupAbis.addMember as any,
      feeType: 'sc',
      inputData
    })
  }
}
