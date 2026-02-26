import { container } from '@/container'
import { useDetailedSettings } from '@/features/settings/hooks'
import { useEffect, useState } from 'react'

export function useTitleNotification() {
  const { data: settings } = useDetailedSettings()
  const [count, setCount] = useState(0)

  // listen notification event
  useEffect(() => {
    const handler = (e: any) => {
      // nếu tab đang focus thì bỏ qua
      if (!document.hidden) return

      if (e.type === 'reaction' && settings?.reactionsEnabled) {
        setCount((prev) => prev + 1)
      }

      if (e.type === 'message' && settings?.p2pChatEnabled) {
        setCount((prev) => {
          return prev + 1
        })
      }
    }

    container.eventBus.on('noti:add', handler)

    return () => {
      container.eventBus.off('noti:add', handler)
    }
  }, [settings])

  // reset count khi user quay lại tab
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        setCount(0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // update title
  useEffect(() => {
    const baseTitle = 'App chat'

    document.title = count > 0 ? `(${count}) Notifications` : baseTitle
  }, [count])
}
