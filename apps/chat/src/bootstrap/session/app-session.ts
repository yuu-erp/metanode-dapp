import { contractConfig } from '@/config/contract.config'
import { bootstrapFactoryBlockchain } from '../blockchain/factory-blockchain'
import { bootstrapAccountFeature } from '../features/accounts'
import { bootstrapWalletFeature } from '../features/wallets'
import { bootstrapUserBlockchain } from '../blockchain/user-blockchain'
import { bootstrapConversationFeature } from '../features/conversations'

let currentSession: {
  wallet: ReturnType<typeof bootstrapWalletFeature>
  factoryBlockchain: ReturnType<typeof bootstrapFactoryBlockchain>
  userBlockchain: ReturnType<typeof bootstrapUserBlockchain>
  account: ReturnType<typeof bootstrapAccountFeature>
  conversation?: ReturnType<typeof bootstrapConversationFeature>
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
  currentSession = {
    wallet,
    factoryBlockchain,
    userBlockchain,
    account
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
    userConversationService: session.userBlockchain.userContractService
  })
  console.log('session', session)
}

export function getSession() {
  if (!currentSession) {
    throw new Error('App not initialized')
  }
  return currentSession
}
