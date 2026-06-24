import { useRoomStore, useUserStore } from '@app/call'
import { memo } from 'react'

export type UserCountProps = {}

export const UserCount = memo(({}: UserCountProps) => {
  const count = useUserStore((s) => s.users.length)
  const isMeet = useRoomStore((s) => s.isMeet)

  if (count < 2 || !isMeet) return null
  return <div className="p-2">{count} member</div>
})
