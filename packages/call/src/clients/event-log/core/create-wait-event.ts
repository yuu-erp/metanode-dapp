import { resolveEventBus } from './helper'
import { EventBusOrGetter } from './types'

export function createWaitEvent<T extends object>(
  eventBusOrGetter: EventBusOrGetter,
  timeout = 5000
) {
  return function waitEvent<K extends keyof T & string>(
    name: K,
    filter?: (payload: T[K]) => boolean
  ) {
    const eventBus = resolveEventBus(eventBusOrGetter)

    return new Promise<T[K]>((resolve, reject) => {
      const cb = (e: T[K]) => {
        if (filter && !filter(e)) return

        cleanup()
        resolve(e)
      }

      const cleanup = () => {
        clearTimeout(timeoutId)
        eventBus.off(name, cb)
      }

      const timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error(`Wait event ${name} timeout`))
      }, timeout)

      eventBus.on(name, cb)
    })
  }
}
