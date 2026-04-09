import { useEffect, useRef } from 'react'
import { resolveEventBus } from './helper'
import { EventBusOrGetter } from './types'

export function createUseEventBus<T extends object>(eventBusOrGetter: EventBusOrGetter) {
  return function useEventBus<K extends keyof T & string>(
    name: K,
    cb: (e: T[K]) => void,
    filter?: (payload: T[K]) => boolean
  ) {
    const cbRef = useRef(cb)
    cbRef.current = cb

    useEffect(() => {
      const eventBus = resolveEventBus(eventBusOrGetter)

      const handler = (e: T[K]) => {
        if (filter && !filter(e)) return
        cbRef.current(e)
      }

      eventBus.on(name, handler)
      return () => eventBus.off(name, handler)
    }, [name, filter])
  }
}
