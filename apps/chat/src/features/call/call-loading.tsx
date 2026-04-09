import { useCallStore } from '@app/call'
import { memo, useEffect, useMemo } from 'react'
import { useModalStore } from '../modal'

export const CallLoading = memo(() => {
  const { joined, connected, trackPulled } = useCallStore()

  const content = useMemo(() => {
    if (!joined) return 'Joining...'
    if (!connected) return 'Connecting...'
    return 'Loading...'
  }, [joined, connected])

  useEffect(() => {
    if (!joined) return
    useModalStore.setState({ meetingUrl: true })
  }, [joined])

  if (trackPulled) return null
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
      <p>{content}</p>
    </div>
  )
})
