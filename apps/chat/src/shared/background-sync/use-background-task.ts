'use client'

import { useEffect } from 'react'
import { type BackgroundTask, useBackgroundSyncContext } from './background-sync.context'

export function useBackgroundTask(task: BackgroundTask) {
  const { registerTask, unregisterTask } = useBackgroundSyncContext()

  useEffect(() => {
    registerTask(task)
    return () => unregisterTask(task.id)
    // ❗ chỉ depend id – tránh reset
  }, [task.id])
}
