'use client'

import { useConversationSyncTask } from './tasks'

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  useConversationSyncTask()
  return children
}
