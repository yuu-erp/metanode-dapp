'use client'

import { useBackgroundSyncContext } from './background-sync.context'
import type { SyncStatus } from './background-sync.context'

export function useBackgroundTaskStatus(taskId: string): SyncStatus {
  const { statuses } = useBackgroundSyncContext()
  return statuses[taskId] ?? 'idle'
}
