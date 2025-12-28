import { FactoryContractService, MtnFactoryContract } from '@/infrastructure/blockchain/factory'

export function bootstrapFactoryBlockchain(factoryContract: string) {
  const contract = new MtnFactoryContract(factoryContract)
  const factoryContractService = new FactoryContractService(contract)
  return {
    factoryContractService
  }
}
