import { useEffect, useRef, useState } from 'react'
import { useEventBus } from '../use-eventbus'

export function useReloadOnNative() {
  const [active, setActive] = useState(true)
  const lastFocus = useRef(Date.now())

  useEventBus('event.reload', setActive)

  useEffect(() => {
    if (!active) return
    const cb = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab đang được focus')
        const now = Date.now()

        if (now - lastFocus.current > 1000 * 60 * 5) {
          window.location.reload()
        }
      } else {
        lastFocus.current = Date.now()
        console.log('Tab đang bị ẩn / không focus')
      }
    }
    window.addEventListener('visibilitychange', cb)

    return () => {
      window.addEventListener('visibilitychange', cb)
    }
  }, [active])
}
