import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../type'
import type { CheckUserContractInput } from './types'
import { factoryAbi } from './abis'

export class FactoryContract extends MtnContract {
  constructor() {
    super({ to: '' })
  }

  async checkUserContract(payload: TransactionPayload<CheckUserContractInput>) {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      inputData,
      functionName: 'checkUserContract',
      feeType: 'read',
      abiData: factoryAbi.checkUserContract
    })
  }
}

export const factoryContract = new FactoryContract()
