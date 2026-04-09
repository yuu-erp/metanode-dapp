import { container } from '@/container'
import type { AppEvents } from '@/types/app-events'
import { useEffect, useRef } from 'react'

export function useEventBus<K extends keyof AppEvents>(name: K, cb: (e: AppEvents[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  return useEffect(() => {
    const cb = cbRef.current

    container.eventBus.on(name, cb)
    return () => container.eventBus.off(name, cb)
  }, [])
}
