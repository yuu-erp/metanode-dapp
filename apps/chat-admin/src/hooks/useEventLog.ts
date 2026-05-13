import type { EventMap } from '@/contract/types'
import { eventLog } from '@/shared'
import { useEffect, useRef } from 'react'

export function useEventLog<K extends keyof EventMap>(name: K, cb: (e: EventMap[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  useEffect(() => {
    const handler = (e: EventMap[K]) => {
      cbRef.current(e)
    }

    const off = eventLog.on(name as any, handler)

    return () => off()
  }, [name])
}
