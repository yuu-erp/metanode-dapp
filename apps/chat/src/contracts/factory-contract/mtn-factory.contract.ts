import { contractConfig } from '@/config/contract.config'
import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../type'
import type {
  CheckUserContractInput,
  GetUserContractInput,
  IsUsernameTakenInput,
  RegisterUserInput
} from './types'
import { factoryAbi } from './abis'

export class FactoryContract extends MtnContract {
  constructor() {
    super({ to: contractConfig.factory })
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
      abiData: factoryAbi.registerUser
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
}

export const factoryContract = new FactoryContract()
