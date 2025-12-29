import {
  BlockchainConversationProvider,
  ConversationDexieDB,
  DexieConversationRepository
} from '@/services/conversations/infrastructure'

import { ConversationService, ConversationSyncService } from '@/services/conversations/application'
import type { Account } from '@/services/account/domain'

export function bootstrapConversationFeature(params: {
  account: Account
  userConversationService: any
  securityService: any
}) {
  const { account, userConversationService, securityService } = params
  const db = new ConversationDexieDB(`conversation_db_${account.address}`)

  const repository = new DexieConversationRepository(db)

  const conversationService = new ConversationService(repository)
  const provider = new BlockchainConversationProvider(
    userConversationService,
    account,
    securityService
  )

  const syncService = new ConversationSyncService(repository, provider)

  return {
    service: conversationService,
    sync: syncService
  }
}
