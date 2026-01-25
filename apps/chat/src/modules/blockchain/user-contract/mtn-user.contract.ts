import { MtnContract } from '@metanodejs/mtn-contract'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import type { TransactionPayload } from '../types'
import { userAbi } from './abis'
import type {
  EditMessageInput,
  GetFullInboxOutput,
  GetProcessedP2PMessagesInput,
  GetProcessedP2PMessagesOutput,
  ReactToMessageInput,
  SendMessageInput,
  SendMessageOutput,
  UserProfileOutput
} from './types'

export class UserContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.userImplementation })
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
      feeType: 'read'
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
}
