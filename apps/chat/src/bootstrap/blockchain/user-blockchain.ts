import {
  MtnUserConversationContract,
  UserConversationService
} from '@/infrastructure/blockchain/user'

export function bootstrapUserBlockchain(userContract: string) {
  const contract = new MtnUserConversationContract(userContract)
  const userContractService = new UserConversationService(contract)
  return {
    userContractService
  }
}
