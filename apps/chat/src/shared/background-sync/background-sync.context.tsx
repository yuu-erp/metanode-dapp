'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

/* =======================
 * Types
 * ======================= */

export type BackgroundTaskId = string

export type BackgroundTaskStatus = 'idle' | 'connecting' | 'updating' | 'error' | 'stopped'

export interface BackgroundTask {
  id: BackgroundTaskId
  interval: number
  run: () => Promise<void>
  enabled?: () => boolean
  maxRuns?: number // undefined = infinite
}

interface BackgroundSyncContextValue {
  registerTask: (task: BackgroundTask) => void
  unregisterTask: (id: BackgroundTaskId) => void
  clearAllTasks: () => void
  statuses: Record<BackgroundTaskId, BackgroundTaskStatus>
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
  const timers = useRef(new Map<BackgroundTaskId, number>())
  const runCounts = useRef(new Map<BackgroundTaskId, number>())

  const [statuses, setStatuses] = useState<Record<BackgroundTaskId, BackgroundTaskStatus>>({})

  /* ---------- network ---------- */

  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  // 🔑 FIX: ref để tránh closure
  const onlineRef = useRef(online)

  useEffect(() => {
    onlineRef.current = online
  }, [online])

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  /* ---------- force connecting when offline ---------- */

  useEffect(() => {
    if (!online) {
      setStatuses((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((id) => {
          if (next[id] !== 'stopped') {
            next[id] = 'connecting'
          }
        })
        return next
      })
    }
  }, [online])

  /* ---------- helpers ---------- */

  const setTaskStatus = (id: BackgroundTaskId, status: BackgroundTaskStatus) => {
    setStatuses((prev) => {
      if (prev[id] === status) return prev
      return { ...prev, [id]: status }
    })
  }

  const stopTask = (id: BackgroundTaskId) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearInterval(timer)
      timers.current.delete(id)
    }
    setTaskStatus(id, 'stopped')
  }

  /* ---------- core ---------- */

  const startTask = (task: BackgroundTask) => {
    if (timers.current.has(task.id)) return

    const execute = async (isRetry = false) => {
      // ❌ offline → không chạy, giữ connecting
      if (!onlineRef.current) {
        setTaskStatus(task.id, 'connecting')
        return
      }

      if (task.enabled && !task.enabled()) return

      const currentRuns = runCounts.current.get(task.id) ?? 0
      const maxRuns = task.maxRuns ?? Infinity

      if (!isRetry && currentRuns >= maxRuns) {
        stopTask(task.id)
        return
      }

      setTaskStatus(task.id, currentRuns === 0 ? 'connecting' : 'updating')

      if (!isRetry) {
        runCounts.current.set(task.id, currentRuns + 1)
      }

      try {
        await task.run()

        if (onlineRef.current) {
          setTaskStatus(task.id, 'idle')
        }
      } catch (err) {
        console.error(`[BG TASK ERROR] ${task.id}`, err)
        setTaskStatus(task.id, 'error')

        // 🔁 retry sau 3s
        setTimeout(() => {
          // nếu task đã bị stop thì không retry
          if (!timers.current.has(task.id)) return

          execute(true)
        }, 3000)
      }
    }

    // run ngay
    execute()

    const timer = window.setInterval(() => {
      execute()
    }, task.interval)

    timers.current.set(task.id, timer)
  }

  /* ---------- public ---------- */

  const registerTask = (task: BackgroundTask) => {
    runCounts.current.set(task.id, 0)
    setTaskStatus(task.id, online ? 'idle' : 'connecting')
    startTask(task)
  }

  const unregisterTask = (id: BackgroundTaskId) => {
    stopTask(id)
    runCounts.current.delete(id)
  }

  /** ⭐ CLEAR ALL TASKS */
  const clearAllTasks = () => {
    timers.current.forEach((timer) => clearInterval(timer))
    timers.current.clear()
    runCounts.current.clear()

    setStatuses((prev) => {
      const next: typeof prev = {}
      Object.keys(prev).forEach((id) => {
        next[id] = 'stopped'
      })
      return next
    })
  }

  /* ---------- cleanup ---------- */

  useEffect(() => {
    return () => {
      timers.current.forEach(clearInterval)
      timers.current.clear()
    }
  }, [])

  console.log('statuses', statuses)

  return (
    <BackgroundSyncContext.Provider
      value={{
        registerTask,
        unregisterTask,
        clearAllTasks,
        statuses
      }}
    >
      {children}
    </BackgroundSyncContext.Provider>
  )
}
