import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { anonymousGroupAbi } from './abis'

export class AnonymousGroupContract extends MtnContract {
  constructor() {
    super({ to: '', isFreeGas: true })
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

  groupAvatar(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'groupAvatar',
      abiData: anonymousGroupAbi.groupAvatar,
      feeType: 'read'
    })
  }

  async getProcessedGroupMessagesWithReactions(
    payload: TransactionPayload<{
      page: number
      limit: number
      sender: string
    }>
  ) {
    const { from, to, inputData } = payload

    const rs = await this.sendTransaction({
      from,
      to,
      functionName: 'getProcessedGroupMessagesWithReactions',
      abiData: anonymousGroupAbi.getProcessedGroupMessagesWithReactions,
      feeType: 'read',
      inputData
    })
    return rs
  }

  addMember(
    payload: TransactionPayload<{
      addedBy: string
      newMember: string
      teamId: string
      _alias: string
      avatarUser: string
      encryptedKeyForNewMember: string
    }>
  ) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'addMember',
      abiData: anonymousGroupAbi.addMember,
      feeType: 'sc',
      inputData: inputData
    })
  }

  addManyMember(
    payload: TransactionPayload<{
      addedBy: string
      newMembers: string[]
      teamId: string
      avatarUser: string
      encryptedKeys: string[]
    }>
  ) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'addManyMember',
      abiData: anonymousGroupAbi.addManyMember,
      feeType: 'sc',
      inputData: inputData
    })
  }

  reactToMessage(
    payload: TransactionPayload<{
      messageId: string
      reaction: string
    }>
  ) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'reactToMessage',
      abiData: anonymousGroupAbi.reactToMessage,
      feeType: 'sc',
      inputData: inputData
    })
  }

  initialAdmin(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'initialAdmin',
      abiData: anonymousGroupAbi.initialAdmin,
      feeType: 'read'
    })
  }

  groupName(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'groupName',
      abiData: anonymousGroupAbi.groupName,
      feeType: 'read'
    })
  }

  getAllMembers(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getAllMembers',
      abiData: anonymousGroupAbi.getAllMembers,
      feeType: 'read'
    })
  }

  getAliasMember(payload: TransactionPayload<{}>) {
    const { from, to } = payload
    return this.sendTransaction<string>({
      from,
      to,
      functionName: 'getAliasMember',
      abiData: anonymousGroupAbi.getAliasMember,
      feeType: 'read'
    })
  }

  unReactToMessage(payload: TransactionPayload<{ messageId: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<{
      memberAlias: string
      teamId: string
      avatarUser: string
    }>({
      from,
      to,
      functionName: 'unReactToMessage',
      abiData: anonymousGroupAbi.unReactToMessage,
      feeType: 'sc',
      inputData
    })
  }

  getMessageById(payload: TransactionPayload<{ _messageId: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<BCAnonymousGroupMessage>({
      from,
      to,
      functionName: 'getMessageById',
      abiData: anonymousGroupAbi.getMessageById,
      feeType: 'read',
      inputData
    })
  }

  markMessagesAsRead(payload: TransactionPayload<{ messageIds: string[] }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'markMessagesAsRead',
      abiData: anonymousGroupAbi.markMessagesAsRead,
      feeType: 'sc',
      inputData
    })
  }

  pinMessage(payload: TransactionPayload<{ messageId: string; isPinned: boolean }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'pinMessage',
      abiData: anonymousGroupAbi.pinMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  userToPublicKeyAdmin(payload: TransactionPayload<{ '': string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string>({
      from,
      to,
      functionName: 'userToPublicKeyAdmin',
      abiData: anonymousGroupAbi.userToPublicKeyAdmin as any,
      feeType: 'read',
      inputData
    })
  }

  setComposingStatusCommunity(payload: TransactionPayload<{ status: string; content: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'setComposingStatusCommunity',
      abiData: anonymousGroupAbi.setComposingStatusCommunity as any,
      feeType: 'sc',
      inputData
    })
  }

  getListPinnedMessagesCommunity(payload: TransactionPayload<{}>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string[]>({
      from,
      to,
      functionName: 'getListPinnedMessagesCommunity',
      abiData: anonymousGroupAbi.getListPinnedMessagesCommunity as any,
      feeType: 'read',
      inputData
    })
  }

  transferOwnership(
    payload: TransactionPayload<{
      newOwner: string
      _pkAdmin: string
    }>
  ) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'transferOwnership',
      abiData: anonymousGroupAbi.transferOwnership,
      feeType: 'sc',
      inputData: inputData
    })
  }
}
