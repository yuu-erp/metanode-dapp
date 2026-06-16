import { useEffect, useRef } from 'react'
import { resolveEventBus } from './helper'
import { EventBusOrGetter } from './types'
import { removeOx } from './create-wait-event'

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
        e = removeOx(e)
        cbRef.current(e)
      }

      const off = eventBus.on(name, handler) as any
      return () => {
        eventBus.off(name, handler)
        off?.()
      }
    }, [name, filter])
  }
}
