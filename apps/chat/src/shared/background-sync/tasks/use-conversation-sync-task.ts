'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import { useBackgroundTask } from '@/shared/background-sync/use-background-task'
import { ACCOUNT_QUERY_KEY, CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'

export function useConversationSyncTask() {
  useBackgroundTask({
    id: 'conversation-sync',
    interval: 60_000, // demo
    // interval: 3_000, // demo
    enabled: () => {
      const account = queryClient.getQueryData<Account>(ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT)
      return !!container.conversationService && !!account
    },
    run: async () => {
      if (!container.conversationService) return
      const account = queryClient.getQueryData<Account>(ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT)
      if (!account) return
      await container.conversationService.syncByAccount(account)
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
      })
    }
  })
}
