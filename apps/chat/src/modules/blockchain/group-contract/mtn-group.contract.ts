import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { groupAbis } from './abis'

export class GroupContract extends MtnContract {
  constructor() {
    super({ to: '', isFreeGas: true })
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

  addAllMember(payload: TransactionPayload<{ users: string[]; encryptedKeys: string[] }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'addAllMember',
      abiData: groupAbis.addAllMember as any,
      feeType: 'sc',
      inputData
    })
  }

  sendMessage(
    payload: TransactionPayload<{
      encryptedContent: string
      recipientOwners: string[]
      recipientContracts: string[]
    }>
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
      feeType: 'read',
      inputData
    })
  }

  getProcessedGroupMessages(payload: TransactionPayload<{ page: number; limit: number }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<BCGroupMessage[]>({
      from,
      to,
      functionName: 'getProcessedGroupMessages',
      abiData: groupAbis.getProcessedGroupMessages as any,
      feeType: 'read',
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

  groupName(payload: TransactionPayload) {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'groupName',
      abiData: groupAbis.groupName as any,
      feeType: 'read'
    })
  }

  unReactToMessage(payload: TransactionPayload<{ messageId: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'unReactToMessage',
      abiData: groupAbis.unReactToMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  getMessageById(payload: TransactionPayload<{ _messageId: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<BCGroupMessage>({
      from,
      to,
      functionName: 'getMessageById',
      abiData: groupAbis.getMessageById as any,
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
      abiData: groupAbis.markMessagesAsRead as any,
      feeType: 'sc',
      inputData
    })
  }

  transferAdmin(payload: TransactionPayload<{ newAdmin: string; _newPublicKeyAdmin: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'transferAdmin',
      abiData: groupAbis.transferAdmin as any,
      feeType: 'sc',
      inputData
    })
  }
  groupId(payload: TransactionPayload<{}>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string>({
      from,
      to,
      functionName: 'groupId',
      abiData: groupAbis.groupId as any,
      feeType: 'read',
      inputData
    })
  }

  userToPublicKeyAdmin(payload: TransactionPayload<{ '': string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string>({
      from,
      to,
      functionName: 'userToPublicKeyAdmin',
      abiData: groupAbis.userToPublicKeyAdmin as any,
      feeType: 'read',
      inputData
    })
  }

  updateGroupInfo(
    payload: TransactionPayload<{ _newName: string; _newAvatar: string; _newDescription: string }>
  ) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'updateGroupInfo',
      abiData: groupAbis.updateGroupInfo as any,
      feeType: 'sc',
      inputData
    })
  }

  getGroupInfo(payload: TransactionPayload<{}>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<{
      name: string
      avatar: string
      description: string
      memberCount: string
      groupAdmin: string
      isDeleted: boolean
    }>({
      from,
      to,
      functionName: 'getGroupInfo',
      abiData: groupAbis.getGroupInfo as any,
      feeType: 'read',
      inputData
    })
  }

  getListPinnedMessagesGroup(payload: TransactionPayload<{}>) {
    const { from, to, inputData } = payload
    return this.sendTransaction<string[]>({
      from,
      to,
      functionName: 'getListPinnedMessagesGroup',
      abiData: groupAbis.getListPinnedMessagesGroup as any,
      feeType: 'read',
      inputData
    })
  }

  pinMessage(payload: TransactionPayload<{ messageId: string; isPinned: boolean }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'pinMessage',
      abiData: groupAbis.pinMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  pinMessageForAllMembers(payload: TransactionPayload<{ messageId: string; isPinned: boolean }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'pinMessageForAllMembers',
      abiData: groupAbis.pinMessageForAllMembers as any,
      feeType: 'sc',
      inputData
    })
  }

  leaveGroup(payload: TransactionPayload<{ encryptedContent: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'leaveGroup',
      abiData: groupAbis.leaveGroup as any,
      feeType: 'sc',
      inputData
    })
  }

  setComposingStatusGroup(payload: TransactionPayload<{ status: string; content: string }>) {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'setComposingStatusGroup',
      abiData: groupAbis.setComposingStatusGroup as any,
      feeType: 'sc',
      inputData
    })
  }
}
