import { MtnContract } from '@metanodejs/mtn-contract'
import { meosABI } from './abis'
import type { AbiItem } from '@metanodejs/system-core'

export class MeosContract extends MtnContract {
  constructor(to: string, from: string) {
    super({
      to,
      from
    })
  }

  getAllDeployedContracts(): Promise<string[]> {
    return this.sendTransaction({
      abiData: meosABI.getAllDeployedContracts as AbiItem,
      functionName: 'getAllDeployedContracts',
      feeType: 'read'
    })
  }
}
