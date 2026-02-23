import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { anonymousGroupAbi } from './abis'

export class AnonymousGroupContract extends MtnContract {
  constructor() {
    super({ to: '' })
  }

  sendMessage(payload: TransactionPayload<{ encryptedContent: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'sendMessage',
      abiData: anonymousGroupAbi.sendMessage,
      feeType: 'sc',
      inputData
    })
  }

  editMessage(payload: TransactionPayload<{ messageId: string; newEncryptedContent: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'editMessage',
      abiData: anonymousGroupAbi.editMessage,
      feeType: 'sc',
      inputData
    })
  }

  deleteMessage(payload: TransactionPayload<{ messageId: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'deleteMessage',
      abiData: anonymousGroupAbi.deleteMessage,
      feeType: 'sc',
      inputData
    })
  }

  getMyEncryptedGroupKey(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getMyEncryptedGroupKey',
      abiData: anonymousGroupAbi.getMyEncryptedGroupKey,
      feeType: 'read'
    })
  }

  getProcessedGroupMessagesWithReactions(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getProcessedGroupMessagesWithReactions',
      abiData: anonymousGroupAbi.getProcessedGroupMessagesWithReactions,
      feeType: 'read'
    })
  }
}
