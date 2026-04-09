import { container } from '@/container'
import type { EventMap } from '@/modules/eventlogs'
import { useEffect, useRef } from 'react'

export function useEventLog<K extends keyof EventMap>(name: K, cb: (e: EventMap[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  useEffect(() => {
    const handler = (e: EventMap[K]) => {
      cbRef.current(e)
    }

    const off = container.eventLogContainer.eventLog.on(name as any, handler)

    return () => off()
  }, [name])
}
