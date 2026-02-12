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

  sendMessage(
    payload: TransactionPayload<{ encryptedContent: string; recipientOwners: string[] }>
  ) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'sendMessage',
      abiData: groupAbis.sendMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  getMemberListGroup(payload: TransactionPayload<{}>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string[]>({
      from,
      to,
      functionName: 'getMemberListGroup',
      abiData: groupAbis.getMemberListGroup as any,
      feeType: 'sc',
      inputData
    })
  }

  getProcessedGroupMessages(payload: TransactionPayload<{ page: number; limit: number }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string[]>({
      from,
      to,
      functionName: 'getProcessedGroupMessages',
      abiData: groupAbis.getProcessedGroupMessages as any,
      feeType: 'sc',
      inputData
    })
  }

  editMessage(payload: TransactionPayload<{ messageId: string; newEncryptedContent: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<void>({
      from,
      to,
      functionName: 'editMessage',
      abiData: groupAbis.editMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  deleteMessage(payload: TransactionPayload<{ messageId: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<void>({
      from,
      to,
      functionName: 'deleteMessage',
      abiData: groupAbis.deleteMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  reactToMessage(payload: TransactionPayload<{ messageId: string; reaction: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<void>({
      from,
      to,
      functionName: 'reactToMessage',
      abiData: groupAbis.reactToMessage as any,
      feeType: 'sc',
      inputData
    })
  }
}
