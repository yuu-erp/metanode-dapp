import { useQuery } from '@tanstack/react-query'
import { ContractManager } from '@/shared/services/contracts'
import { queryKeys } from '@/shared/consts/query-keys'

export function createAgentContractsQuery(domain: string) {
  return {
    queryKey: queryKeys.agent.contracts(domain),
    queryFn: async () => {
      const manager = ContractManager.getInstance()
      await manager.initialize(domain)

      return {
        agentInfo: manager.getAgentInfo(),
        meosAddresses: manager.getMeosAddresses()
      }
    }
  }
}

export const useAgentContracts = (domain: string) => {
  return useQuery(createAgentContractsQuery(domain))
}
