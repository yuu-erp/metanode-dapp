import { useCurrentConversationType, useGetConversationByAddress } from '@/shared/hooks'
import { memo } from 'react'

export type GroupMemberNameProps = {
  sender: string
}
export const GroupMemberName = memo(({ sender }: GroupMemberNameProps) => {
  const type = useCurrentConversationType()
  const user = useGetConversationByAddress(sender, 'p2p')

  return <div className="text-xs font-bold">{type === 'anonymous_group' ? sender : user?.name}</div>
})
