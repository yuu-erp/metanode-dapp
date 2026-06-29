import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { userAbi } from './abis'
import type {
  DeleteMessageV2Input,
  DetailedSettings,
  EditMessageInput,
  GetFullInboxOutput,
  GetMessageByIdInput,
  GetMessageByIdOutput,
  GetProcessedP2PMessagesInput,
  GetProcessedP2PMessagesOutput,
  ReactToMessageInput,
  SendDataChannelInput,
  SendMessageInput,
  SendMessageOutput,
  SetMeetingFactoryInput,
  SetP2PChatEnabledInput,
  SetReactionsEnabledInput,
  UserProfileOutput
} from './types'
import type { UserMehods } from '@/contract-types/user/user.methods'

export class UserContract extends MtnContract {
  constructor() {
    super({ to: '' })
  }

  userProfile(payload: TransactionPayload): Promise<UserProfileOutput> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'userProfile',
      abiData: userAbi.userProfile as any,
      feeType: 'read'
    })
  }

  getFullInbox(payload: TransactionPayload): Promise<GetFullInboxOutput[]> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getFullInbox',
      abiData: userAbi.getFullInbox as any,
      feeType: 'read'
    })
  }

  getFullInboxPaginatedOptimized(
    payload: TransactionPayload<{ limit: number; offset: number }>
  ): Promise<any[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getFullInboxPaginatedOptimized',
      abiData: userAbi.getFullInboxPaginatedOptimized as any,
      feeType: 'read',
      inputData: inputData
    })
  }

  publicKey(payload: TransactionPayload): Promise<string> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'publicKey',
      abiData: userAbi.publicKey as any,
      feeType: 'read'
    })
  }

  getProcessedP2PMessages(
    payload: TransactionPayload<GetProcessedP2PMessagesInput>
  ): Promise<GetProcessedP2PMessagesOutput[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getProcessedP2PMessages',
      abiData: userAbi.getProcessedP2PMessages as any,
      inputData,
      feeType: 'read'
    })
  }

  sendMessage(payload: TransactionPayload<SendMessageInput>): Promise<SendMessageOutput> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'sendMessage',
      abiData: userAbi.sendMessage as any,
      inputData,
      feeType: 'sc',
      gas: 2_000_000
    })
  }

  reactToMessage(payload: TransactionPayload<ReactToMessageInput>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'reactToMessage',
      abiData: userAbi.reactToMessage as any,
      inputData,
      feeType: 'sc'
    })
  }

  editMessage(payload: TransactionPayload<EditMessageInput>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'editMessage',
      abiData: userAbi.editMessage as any,
      inputData,
      feeType: 'sc'
    })
  }

  deleteMessageV2(payload: TransactionPayload<DeleteMessageV2Input>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'deleteMessageV2',
      abiData: userAbi.deleteMessageV2 as any,
      inputData,
      feeType: 'sc'
    })
  }

  sendDataChannel(payload: TransactionPayload<SendDataChannelInput>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'sendDataChannel',
      abiData: userAbi.sendDataChannel as any,
      inputData,
      feeType: 'sc'
    })
  }

  getMessageById(payload: TransactionPayload<GetMessageByIdInput>): Promise<GetMessageByIdOutput> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getMessageById',
      abiData: userAbi.getMessageById as any,
      inputData,
      feeType: 'read'
    })
  }

  getReaction(
    payload: TransactionPayload<{ _messageId: string; _reactor: string }>
  ): Promise<string> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getReaction',
      abiData: userAbi.getReaction as any,
      inputData,
      feeType: 'read'
    })
  }

  setMeetingFactory(payload: TransactionPayload<SetMeetingFactoryInput>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'setMeetingFactory',
      abiData: userAbi.setMeetingFactory as any,
      inputData,
      feeType: 'sc'
    })
  }

  meetingFactoryAddress(payload: TransactionPayload): Promise<string> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'meetingFactoryAddress',
      abiData: userAbi.meetingFactoryAddress as any,
      feeType: 'read'
    })
  }

  owner(payload: TransactionPayload): Promise<string> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'owner',
      abiData: userAbi.owner as any,
      feeType: 'read'
    })
  }

  detailedSettings(payload: TransactionPayload): Promise<{
    p2pChatEnabled: boolean
    reactionsEnabled: boolean
    showPreview: boolean
  }> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'detailedSettings',
      abiData: userAbi.detailedSettings as any,
      feeType: 'read'
    })
  }

  getDetailedSettings(payload: TransactionPayload): Promise<DetailedSettings> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getDetailedSettings',
      abiData: userAbi.getDetailedSettings as any,
      feeType: 'read'
    })
  }

  setP2PChatEnabled(payload: TransactionPayload<SetP2PChatEnabledInput>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'setP2PChatEnabled',
      abiData: userAbi.setP2PChatEnabled as any,
      inputData,
      feeType: 'sc'
    })
  }

  setReactionsEnabled(payload: TransactionPayload<SetReactionsEnabledInput>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'setReactionsEnabled',
      abiData: userAbi.setReactionsEnabled as any,
      inputData,
      feeType: 'sc'
    })
  }

  addDelegate(payload: TransactionPayload<{ _delegate: string }>): Promise<void> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'addDelegate',
      abiData: userAbi.addDelegate as any,
      inputData,
      feeType: 'sc'
    })
  }

  getDelegates(payload: TransactionPayload<{}>): Promise<string[]> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getDelegates',
      abiData: userAbi.getDelegates as any,
      feeType: 'read'
    })
  }

  removeDelegate(payload: TransactionPayload<{ _delegate: string }>): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'removeDelegate',
      abiData: userAbi.removeDelegate as any,
      feeType: 'sc',
      inputData
    })
  }

  unReactToMessage(
    payload: TransactionPayload<{ partnerContract: string; messageId: string }>
  ): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'unReactToMessage',
      abiData: userAbi.unReactToMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  markMessagesAsRead(
    payload: TransactionPayload<{ partnerContract: string; messageIds: string[] }>
  ): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'markMessagesAsRead',
      abiData: userAbi.markMessagesAsRead as any,
      feeType: 'sc',
      inputData
    })
  }

  removeContact(payload: TransactionPayload<{ _contactAddress: string }>): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'RemoveContact',
      abiData: userAbi.RemoveContact as any,
      feeType: 'sc',
      inputData
    })
  }

  pinMessage(
    payload: TransactionPayload<{ partner: string; messageId: string }>
  ): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'pinMessage',
      abiData: userAbi.pinMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  unpinMessage(
    payload: TransactionPayload<{ partner: string; messageId: string }>
  ): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'unpinMessage',
      abiData: userAbi.unpinMessage as any,
      feeType: 'sc',
      inputData
    })
  }

  async getPinnedMessages(payload: TransactionPayload<{ partner: string }>): Promise<string[]> {
    const { from, to, inputData } = payload
    const rs = await this.sendTransaction({
      from,
      to,
      functionName: 'getPinnedMessages',
      abiData: userAbi.getPinnedMessages as any,
      feeType: 'read',
      inputData
    })

    return rs
  }

  setComposingStatus(
    payload: TransactionPayload<{ recipient: string; status: string; content: string }>
  ): Promise<string[]> {
    const { from, to, inputData } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'setComposingStatus',
      abiData: userAbi.setComposingStatus as any,
      feeType: 'sc',
      inputData
    })
  }

  async conversationCache(
    payload: TransactionPayload<{ '': string }>
  ): Promise<UserMehods['conversationCache'][1]> {
    const { from, to, inputData } = payload
    const rs = await this.sendTransaction({
      from,
      to,
      functionName: 'conversationCache',
      abiData: userAbi.conversationCache as any,
      feeType: 'read',
      inputData
    })

    return rs
  }
}
