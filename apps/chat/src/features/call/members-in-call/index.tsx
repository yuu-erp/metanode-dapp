import { useCallStore, useRoomStore, useUserStore } from '@app/call'
import { memo } from 'react'

export const MembersInCall = memo(() => {
  const trackPulled = useCallStore((s) => s.trackPulled)
  const isMeet = useRoomStore((s) => s.isMeet)

  const data = useUserStore((s) => s.users)

  if (!data || !trackPulled || !isMeet) return null
  return <div>{`${data.length} members`}</div>
})
