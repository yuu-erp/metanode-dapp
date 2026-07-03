import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import { factoryAbi } from './abis'
import type {
  CheckUserContractInput,
  CreateAnonymousCommunityInput,
  CreateGroupInput,
  GetUserContractInput,
  IsUsernameTakenInput,
  RegisterUserInput
} from './types'
import { CONTRACT_ADDRESSES } from '@/config'
import { formatAddress } from '@/shared/utils'

export class FactoryContract extends MtnContract {
  constructor() {
    super({ to: formatAddress(CONTRACT_ADDRESSES.factory) })
  }
  checkUserContract(payload: TransactionPayload<CheckUserContractInput>): Promise<boolean> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'checkUserContract',
      feeType: 'read',
      abiData: factoryAbi.checkUserContract
    })
  }

  registerUser(payload: TransactionPayload<RegisterUserInput>): Promise<void> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'registerUser',
      feeType: 'sc',
      abiData: factoryAbi.registerUser,
      gas: 2_000_000
    })
  }

  isUsernameTaken(payload: TransactionPayload<IsUsernameTakenInput>): Promise<boolean> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'isUsernameTaken',
      feeType: 'read',
      abiData: factoryAbi.isUsernameTaken
    })
  }

  getUserContract(payload: TransactionPayload<GetUserContractInput>): Promise<string> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'getUserContract',
      feeType: 'read',
      abiData: factoryAbi.getUserContract
    })
  }

  createGroup(payload: TransactionPayload<CreateGroupInput>): Promise<void> {
    const { from, inputData } = payload
    console.log('createGroup 1', { from })
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'createGroup',
      feeType: 'sc',
      abiData: factoryAbi.createGroup
    })
  }

  async createAnonymousCommunity(
    payload: TransactionPayload<CreateAnonymousCommunityInput>
  ): Promise<void> {
    const { from, inputData } = payload
    console.log('createAnonymousCommunity 1')
    const rs = await this.sendTransaction({
      from,
      inputData,
      functionName: 'createAnonymousCommunity',
      feeType: 'sc',
      abiData: factoryAbi.createAnonymousCommunity
    })
    console.log('createAnonymousCommunity 2')

    return rs
  }
  deleteGroup(payload: TransactionPayload<{ groupId: string }>): Promise<void> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'deleteGroup',
      feeType: 'sc',
      abiData: factoryAbi.deleteGroup
    })
  }

  deleteAnonymousCommunity(payload: TransactionPayload<{ groupToDelete: string }>): Promise<void> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'deleteAnonymousCommunity',
      feeType: 'sc',
      abiData: factoryAbi.deleteAnonymousCommunity
    })
  }

  isUserDisabled(payload: TransactionPayload<{ user: string }>): Promise<boolean> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'isUserDisabled',
      feeType: 'read',
      abiData: factoryAbi.isUserDisabled
    })
  }
}
