import { useGetConversationByAddress } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { memo } from 'react'

export type GroupMemberNameProps = {
  sender: string
}
export const GroupMemberName = memo(({ sender }: GroupMemberNameProps) => {
  const { type } = useConversationParams()
  const user = useGetConversationByAddress(sender, 'p2p', true, false)

  return <div className="text-xs font-bold">{type === 'anonymous_group' ? sender : user?.name}</div>
})
