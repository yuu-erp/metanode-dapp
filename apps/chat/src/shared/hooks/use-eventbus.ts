import { container } from '@/container'
import type { AppEvents } from '@/types/app-events'
import { useEffect, useRef } from 'react'

export function useEventBus<K extends keyof AppEvents>(name: K, cb: (e: AppEvents[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  useEffect(() => {
    const handler = (e: AppEvents[K]) => {
      cbRef.current(e)
    }

    container.eventBus.on(name, handler)
    return () => container.eventBus.off(name, handler)
  }, [name])
}
