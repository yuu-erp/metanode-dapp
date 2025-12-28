import { AccountOnboardingService, AccountService } from '@/services/account/application'
import { AccountDexieDB, DexieAccountRepository } from '@/services/account/infrastructure'

export function bootstrapAccountFeature(params: {
  walletService: any
  blockchain: {
    userConversationService: any
    factoryContractService: any
  }
}) {
  const db = new AccountDexieDB(`accounts_db`)

  const repository = new DexieAccountRepository(db)

  const accountService = new AccountService(repository)

  const accountOnboardingService = new AccountOnboardingService(
    repository,
    params.walletService,
    params.blockchain.factoryContractService,
    params.blockchain.userConversationService
  )
  return {
    accountService,
    accountOnboardingService
  }
}
