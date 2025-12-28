import type { TransactionPayload } from '../type'
import type { FactoryContract } from './factory.contract'
import type { RegisterUserInput } from './types'

export class FactoryContractService {
  constructor(private readonly factoryContract: FactoryContract) {}

  async checkUserContract(address: string): Promise<boolean> {
    return this.factoryContract.checkUserContract({
      from: address,
      inputData: { user: address }
    })
  }

  async registerUser(payload: TransactionPayload<RegisterUserInput>) {
    return this.factoryContract.registerUser(payload)
  }

  async isUsernameTaken(from: string, _username: string) {
    return this.factoryContract.isUsernameTaken({ from, inputData: { _username } })
  }

  async getUserContract(user: string): Promise<string> {
    return this.factoryContract.getUserContract({ from: user, inputData: { user } })
  }
}
