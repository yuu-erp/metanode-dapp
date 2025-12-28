import type { FactoryContract } from '@/services/contracts/factory/factory-contract'
import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../type'
import { factoryAbi } from './abis'
import type {
  CheckUserContractInput,
  GetUserContractInput,
  IsUsernameTakenInput,
  RegisterUserInput
} from './types'

export class MtnFactoryContract extends MtnContract implements FactoryContract {
  constructor(to: string) {
    super({ to })
  }
  async checkUserContract(payload: TransactionPayload<CheckUserContractInput>): Promise<boolean> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'checkUserContract',
      feeType: 'read',
      abiData: factoryAbi.checkUserContract
    })
  }

  async registerUser(payload: TransactionPayload<RegisterUserInput>): Promise<void> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'registerUser',
      feeType: 'sc',
      abiData: factoryAbi.registerUser
    })
  }

  async isUsernameTaken(payload: TransactionPayload<IsUsernameTakenInput>): Promise<boolean> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'isUsernameTaken',
      feeType: 'read',
      abiData: factoryAbi.isUsernameTaken
    })
  }

  async getUserContract(payload: TransactionPayload<GetUserContractInput>): Promise<string> {
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
