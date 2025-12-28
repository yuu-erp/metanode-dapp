'use client'

import { queryClient } from '@/shared/lib/react-query'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import type { ConversationSyncService } from '@/services/conversations/application'
import { useBackgroundTask } from '@/shared/background-sync/use-background-task'

export function useConversationSyncTask(syncService?: ConversationSyncService) {
  useBackgroundTask({
    id: 'conversation-sync',
    interval: 5 * 60_000, // demo
    enabled: () => !!syncService,
    run: async () => {
      if (!syncService) return
      const conversations = await syncService.sync()
      queryClient.setQueryData(CONVERSATION_QUERY_KEY.CONVERSATIONS, conversations)
    }
  })
}
