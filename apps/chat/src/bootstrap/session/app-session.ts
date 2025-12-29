import { contractConfig } from '@/config/contract.config'
import { bootstrapFactoryBlockchain } from '../blockchain/factory-blockchain'
import { bootstrapUserBlockchain } from '../blockchain/user-blockchain'
import { bootstrapAccountFeature } from '../features/accounts'
import { bootstrapConversationFeature } from '../features/conversations'
import { bootstrapWalletFeature } from '../features/wallets'
import { bootstrapMessageSecurity } from '../security/message-security'

let currentSession: {
  wallet: ReturnType<typeof bootstrapWalletFeature>
  factoryBlockchain: ReturnType<typeof bootstrapFactoryBlockchain>
  userBlockchain: ReturnType<typeof bootstrapUserBlockchain>
  account: ReturnType<typeof bootstrapAccountFeature>
  conversation?: ReturnType<typeof bootstrapConversationFeature>
  security?: ReturnType<typeof bootstrapMessageSecurity>
}

export function initApp() {
  const wallet = bootstrapWalletFeature()
  const factoryBlockchain = bootstrapFactoryBlockchain(contractConfig.factory)
  const userBlockchain = bootstrapUserBlockchain(contractConfig.user)
  const account = bootstrapAccountFeature({
    walletService: wallet.walletService,
    blockchain: {
      factoryContractService: factoryBlockchain.factoryContractService,
      userConversationService: userBlockchain.userContractService
    }
  })
  const security = bootstrapMessageSecurity()
  currentSession = {
    wallet,
    factoryBlockchain,
    userBlockchain,
    account,
    security
  }
  console.log(currentSession)
}

export async function initPrivateFeature() {
  const session = getSession()
  const currentAccount = await session.account.accountService.getCurrentAccount()
  if (!currentAccount) {
    console.warn('No active account, skipping conversation feature initialization.')
    return
  }

  session.conversation = bootstrapConversationFeature({
    account: currentAccount,
    userConversationService: session.userBlockchain.userContractService,
    securityService: session.security?.securityService
  })
}

export function getSession() {
  if (!currentSession) {
    throw new Error('App not initialized')
  }
  return currentSession
}
