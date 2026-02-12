import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { userAbi } from './abis'
import type {
  DeleteMessageV2Input,
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
  UserProfileOutput
} from './types'

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
      feeType: 'read',
      gas: '30000000'
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
      feeType: 'read',
      gas: '3000000000'
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
      feeType: 'sc'
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
}
