import { eventBus, type AppEvents } from '@/modules'
import { useEffect, useRef } from 'react'

export function useEventBus<K extends keyof AppEvents>(name: K, cb: (e: AppEvents[K]) => void) {
  const cbRef = useRef(cb)

  cbRef.current = cb

  return useEffect(() => {
    const cb = cbRef.current

    eventBus.on(name, cb)
    return () => eventBus.off(name, cb)
  }, [])
}
