import { useCallStore, useUserStore } from '@app/call'
import { memo } from 'react'

export const MembersInCall = memo(() => {
  const trackPulled = useCallStore((s) => s.trackPulled)

  const data = useUserStore((s) => s.users)

  if (!data || !trackPulled) return null
  return <div>{`${data.length} members`}</div>
})
