'use client'

import { useBackgroundSyncContext } from './background-sync.context'
import type { BackgroundTaskStatus } from './background-sync.context'

export function useBackgroundTaskStatus(taskId: string): BackgroundTaskStatus {
  const { statuses } = useBackgroundSyncContext()
  return statuses[taskId] ?? 'idle'
}
