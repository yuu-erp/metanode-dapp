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
      abiData: userAbi.userProfile,
      feeType: 'read'
    })
  }

  getFullInbox(payload: TransactionPayload): Promise<GetFullInboxOutput[]> {
    const { from, to } = payload
    return this.sendTransaction({
      from,
      to,
      functionName: 'getFullInbox',
      abiData: userAbi.getFullInbox,
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
      abiData: userAbi.publicKey,
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
      abiData: userAbi.getProcessedP2PMessages,
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
      abiData: userAbi.sendMessage,
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
      abiData: userAbi.reactToMessage,
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
      abiData: userAbi.editMessage,
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
      abiData: userAbi.deleteMessageV2,
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
      abiData: userAbi.sendDataChannel,
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
      abiData: userAbi.getMessageById,
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
      abiData: userAbi.setMeetingFactory,
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
      abiData: userAbi.meetingFactoryAddress,
      feeType: 'read'
    })
  }
}
