'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { container } from '@/container'
import { useQuery } from '@tanstack/react-query'
import { createCurrentAccountQueryOptions } from '@/shared/hooks'

/* =======================
 * Types
 * ======================= */

export type SyncStatus = 'idle' | 'running' | 'stopped' | 'error'

interface BackgroundSyncContextValue {
  statuses: Record<string, SyncStatus>
}

/* =======================
 * Context
 * ======================= */

const BackgroundSyncContext = createContext<BackgroundSyncContextValue | null>(null)

export function useBackgroundSyncContext() {
  const ctx = useContext(BackgroundSyncContext)
  if (!ctx) {
    throw new Error('BackgroundSyncProvider is missing')
  }
  return ctx
}

/* =======================
 * Provider
 * ======================= */

export function BackgroundSyncProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, SyncStatus>>({})

  // 1. Get Current Account
  const { data: currentAccount } = useQuery(createCurrentAccountQueryOptions())

  // 2. Lifecycle Management
  useEffect(() => {
    if (currentAccount && currentAccount.isActive) {
      container.syncManager.start(currentAccount)
    } else {
      container.syncManager.stop()
    }

    // Cleanup on unmount (optional, but good practice)
    return () => {
      // Don't stop on unmount if we want background sync to persist across route changes?
      // Actually Provider is in _authenticated which wraps the app.
      // So unmount means logout or close.
      container.syncManager.stop()
    }
  }, [currentAccount, currentAccount?.address])

  // 3. Status Subscription
  useEffect(() => {
    const manager = container.syncManager
    const onStatusChange = ({ strategy, status }: { strategy: string; status: SyncStatus }) => {
      setStatuses((prev) => ({ ...prev, [strategy]: status }))
    }

    manager.events.on('statusChange', onStatusChange)

    return () => {
      manager.events.off('statusChange', onStatusChange)
    }
  }, [])

  return (
    <BackgroundSyncContext.Provider value={{ statuses }}>{children}</BackgroundSyncContext.Provider>
  )
}
