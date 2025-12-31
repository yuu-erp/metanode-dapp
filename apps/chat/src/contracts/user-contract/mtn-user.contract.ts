import { contractConfig } from '@/config/contract.config'
import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../type'
import type {
  GetFullInboxOutput,
  GetProcessedP2PMessagesInput,
  GetProcessedP2PMessagesOutput,
  UserProfileOutput
} from './types'
import { userAbi } from './abis'

export class UserContract extends MtnContract {
  constructor() {
    super({ to: contractConfig.user })
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
      feeType: 'read'
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
}

export const userContract = new UserContract()
