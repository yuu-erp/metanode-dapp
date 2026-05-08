import AvatarUser from '@/shared/components/avatar-user'
import { useGetConversationByAddress } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { memo } from 'react'

export type GroupMemberAvatarProps = {
  sender: string
}
export const GroupMemberAvatar = memo(({ sender }: GroupMemberAvatarProps) => {
  const { type } = useConversationParams()
  const user = useGetConversationByAddress(sender, 'p2p')

  const isGroup = type === 'group'

  return (
    <div className="text-xs font-bold">
      <AvatarUser
        size="sm"
        url={isGroup ? user?.avatar : ''}
        name={(isGroup ? user?.name : sender) ?? ''}
        type={'p2p'}
      />
    </div>
  )
})
