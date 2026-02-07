import { MtnContract } from '@metanodejs/mtn-contract'
import type {
  GetAgentFromDomainArgs,
  GetAgentFromDomainResult,
  GetMeosSCByAgentFromFactoryArgs,
  MeosContracts
} from './types'
import { anhancedAgentManagementABI } from './abis'
import { contractConfig } from '@/config/app.config'

export class EnhancedAgentManagementContract extends MtnContract {
  constructor() {
    super({
      to: contractConfig.enhancedAgentManagement
    })
  }

  async getAgentFromDomain(
    args: GetAgentFromDomainArgs,
    from?: string
  ): Promise<GetAgentFromDomainResult> {
    return this.sendTransaction({
      abiData: anhancedAgentManagementABI.getAgentFromDomain,
      functionName: 'getAgentFromDomain',
      feeType: 'read',
      inputData: args,
      from
    })
  }

  async getMeosSCByAgentFromFactory(
    args: GetMeosSCByAgentFromFactoryArgs,
    from?: string
  ): Promise<MeosContracts> {
    return this.sendTransaction({
      abiData: anhancedAgentManagementABI.getMeosSCByAgentFromFactory,
      functionName: 'getMeosSCByAgentFromFactory',
      feeType: 'read',
      inputData: args,
      from
    })
  }
}

export const enhancedAgentManagementContract = new EnhancedAgentManagementContract()
export type { MeosContracts, GetAgentFromDomainResult } from './types'
