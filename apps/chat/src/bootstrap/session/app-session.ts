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

  // const abi = [
  //   'event MessageReceived(address sender, address recipient, bytes32 messageId, string encryptedContent, address dataStoreAddress, uint256 messageNonce)'
  // ]

  // // const provider = new ethers.WebSocketProvider('wss://rpc-proxy-sequoia.iqnb.com:8446')
  // const provider = new ReconnectingWebSocketProvider('wss://rpc-proxy-sequoia.iqnb.com:8446', {
  //   debug: true
  // })

  // const contract = new ethers.Contract(`0x${currentAccount.contractAddress}`, abi, provider)

  // contract.on(
  //   'MessageReceived',
  //   (sender, recipient, messageId, encryptedContent, dataStoreAddress, messageNonce, event) => {
  //     console.log({
  //       sender,
  //       recipient,
  //       messageId,
  //       encryptedContent,
  //       dataStoreAddress,
  //       messageNonce: messageNonce.toString(),
  //       txHash: event.log.transactionHash,
  //       blockNumber: event.log.blockNumber
  //     })
  //   }
  // )

  session.conversation = bootstrapConversationFeature({
    account: currentAccount,
    userConversationService: session.userBlockchain.userContractService,
    securityService: session.security?.securityService
  })
  console.log('session', session)
}

export function getSession() {
  if (!currentSession) {
    throw new Error('App not initialized')
  }
  return currentSession
}
