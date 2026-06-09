import { container } from '@/container'
import type { EventMap } from '@/modules/eventlogs'
import { useEffect, useRef } from 'react'
import { formatAddress } from '../lib'

export function useEventLog<K extends keyof EventMap>(name: K, cb: (e: EventMap[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  useEffect(() => {
    const handler = (e: EventMap[K]) => {
      const event: any = {}
      for (const key in e) {
        const v = e[key]

        event[key] = typeof v === 'string' && v.length >= 40 ? formatAddress(v) : e[key]
      }

      cbRef.current(event)
    }

    const off = container.eventLogContainer.eventLog.on(name as any, handler)

    return () => off()
  }, [name])
}
