'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { container } from '@/container'
import { useQuery } from '@tanstack/react-query'
import { createCurrentAccountQueryOptions } from '@/shared/hooks'

/* =======================
 * Types
 * ======================= */

export type SyncStatus = 'idle' | 'running' | 'stopped' | 'error' | 'connecting'

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
  const [statuses, setStatuses] = useState<Record<string, SyncStatus>>(() =>
    container.syncManager.getStatuses()
  )

  // 1. Get Current Account
  const { data: currentAccount } = useQuery(createCurrentAccountQueryOptions())

  // 2. Sync Management & Subscription
  useEffect(() => {
    const manager = container.syncManager

    // Register listener BEFORE potentially starting sync
    const onStatusChange = ({ strategy, status }: { strategy: string; status: SyncStatus }) => {
      setStatuses((prev) => ({ ...prev, [strategy]: status }))
    }
    manager.events.on('statusChange', onStatusChange)

    // Initial state sync (in case it changed before listener registered or on mount)
    setStatuses(manager.getStatuses())

    // Start/Stop based on account
    if (currentAccount && currentAccount.isActive) {
      manager.start(currentAccount)
    } else {
      manager.stop()
    }

    return () => {
      manager.events.off('statusChange', onStatusChange)
      manager.stop()
    }
  }, [currentAccount, currentAccount?.address])

  return (
    <BackgroundSyncContext.Provider value={{ statuses }}>{children}</BackgroundSyncContext.Provider>
  )
}
