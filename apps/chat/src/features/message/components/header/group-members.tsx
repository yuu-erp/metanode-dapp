import { useGetGroupMembers } from '@/features/conversation'
import { useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { memo } from 'react'

export type GroupMembersProps = {}

export const GroupMembers = memo(({}: GroupMembersProps) => {
  const { id, type } = useConversationParams()
  const { data: account } = useCurrentAccount()

  const { data } = useGetGroupMembers(account?.hiddenAddress, id, type)
  const count = data?.length ?? 0

  if (!count) return
  return <p>{`${data?.length} Member${count > 1 ? 's' : ''}`}</p>
})
