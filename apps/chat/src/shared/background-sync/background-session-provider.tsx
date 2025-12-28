'use client'

import { getSession } from '@/bootstrap'
import { useConversationSyncTask } from './tasks'

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const { conversation } = getSession()

  useConversationSyncTask(conversation?.sync)

  return children
}
