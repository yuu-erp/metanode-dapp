import { eventLog, type EventLogMap } from '@/modules'
import { useEffect, useRef } from 'react'

export function useEventLog<K extends keyof EventLogMap>(name: K, cb: (e: EventLogMap[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  return useEffect(() => {
    const cb = cbRef.current

    const off = eventLog.eventLog.on(name, cb)
    return () => off()
  }, [])
}
